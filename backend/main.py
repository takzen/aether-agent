from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.encoders import jsonable_encoder
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import aether_agent, db_service, pending_actions
import asyncio
import os
import re
import json
import httpx
from datetime import datetime, timezone
from pathlib import Path
from ingest import process_content, extract_text_from_file, render_pdf_pages_to_base64
from local_db import sqlite_service
from world_model import run_active_world_model_simulation
from cron_scheduler import cron_service

async def reflection_loop():
    """Autonomous background task for periodic self-reflection (AWM)."""
    loop = asyncio.get_running_loop()
    next_run_at = loop.time() + 3600.0
    while True:
        try:
            # Check toggle frequently so ON/OFF reacts quickly, but execute at 60m cadence.
            await asyncio.sleep(30)

            if loop.time() < next_run_at:
                continue

            settings = await sqlite_service.get_settings()
            if settings.get("COGNITION_REFLECTION", "true").lower() == "true":
                print("[CORE] Initiating autonomous Self-Reflection (AWM)...")
                await run_active_world_model_simulation()
                await sqlite_service.add_log("info", "CORE", "Autonomous Self-Reflection cycle completed.")
            next_run_at = loop.time() + 3600.0
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[CORE] Reflection loop error: {e}")
            await asyncio.sleep(60) # Wait a bit before retry on error

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    is_new = await sqlite_service.init_db()
    if is_new:
        await sqlite_service.add_log("success", "CORE", "Aether Kernel Cold Start. Initialized fresh state.")
    else:
        # Just a quiet operational log for reloads
        import time
        await sqlite_service.add_log("info", "CORE", f"Aether Kernel Hot Reloaded (PID: {os.getpid()})")
    
    # Start Telegram Bridge in background
    from telegram_bridge import run_telegram_bot
    telegram_task = asyncio.create_task(run_telegram_bot())

    # Start Autonomous Reflection Loop (Phase 7: Cognition)
    reflection_task = asyncio.create_task(reflection_loop())
    app.state.background_tasks = [telegram_task, reflection_task]

    # Start CRON scheduler
    await cron_service.start()
    
    yield
    
    # Shutdown logic
    for task in getattr(app.state, "background_tasks", []):
        task.cancel()
    if getattr(app.state, "background_tasks", None):
        await asyncio.gather(*app.state.background_tasks, return_exceptions=True)

    await cron_service.stop()
    from telegram_bridge import stop_telegram_bot
    await stop_telegram_bot()
    print("[CORE] Aether Kernel shut down.")

app = FastAPI(title="Aether API", version="1.4.0", lifespan=lifespan)

from typing import Optional, List, Any

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini"
    session_id: Optional[str] = None
    message_history: Optional[List[dict]] = None
    source: Optional[str] = "dashboard"

class ActionApproval(BaseModel):
    action_id: str
    approved: bool


class CronJobUpsert(BaseModel):
    id: Optional[str] = None
    name: str
    trigger_type: Optional[str] = "cron"
    schedule: str
    run_at: Optional[str] = None
    timezone: str = "UTC"
    task: str
    payload: Optional[dict] = None
    enabled: bool = True


class CronToggle(BaseModel):
    enabled: bool

class SkillCreate(BaseModel):
    name: str
    purpose: Optional[str] = ""
    triggers: Optional[str] = ""
    instructions: str

class SkillUpdate(BaseModel):
    name: str
    purpose: Optional[str] = ""
    triggers: Optional[str] = ""
    instructions: str

class SkillRuntimeUpdate(BaseModel):
    agent_enabled: bool = True
    cron_enabled: bool = True

class SkillTemplateApplyRequest(BaseModel):
    filename: str

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _build_ollama_system_prompt(settings: dict) -> str:
    """Builds a lightweight system prompt for direct Ollama fallback mode."""
    persona = str(settings.get("COGNITION_PERSONA", "Balanced"))
    lang = "Polish"
    custom_directives = str(settings.get("COGNITION_CUSTOM_DIRECTIVES", "") or "").strip()

    base = [
        f"Respond in {lang}.",
        "You are Aether assistant. Be concise, technical, and practical.",
        f"Persona: {persona}.",
        "Return plain helpful text. Do not return JSON wrappers."
    ]
    if custom_directives:
        base.append(f"Custom directives: {custom_directives}")
    return "\n".join(base)

async def _run_ollama_generate(
    model_id: str,
    user_prompt: str,
    settings: dict,
    temperature: float,
    images: list[str] | None = None,
    timeout_s: float = 180.0,
) -> str:
    """Direct Ollama text generation fallback for local SLMs."""
    model_name = model_id.replace("ollama:", "", 1)
    payload = {
        "model": model_name,
        "prompt": user_prompt,
        "system": _build_ollama_system_prompt(settings),
        "stream": False,
        "options": {
            "temperature": float(max(0.0, min(1.0, temperature)))
        }
    }
    if images:
        payload["images"] = images

    async with httpx.AsyncClient(timeout=timeout_s) as client:
        resp = await client.post("http://localhost:11434/api/generate", json=payload)
        resp.raise_for_status()
        data = resp.json()
        answer = str(data.get("response", "") or "").strip()
        return answer or "No response generated by local model."

@app.post("/knowledge/vision-index/{filename}")
async def vision_index_pdf(filename: str, max_pages: int = 4, model: str | None = None):
    """
    Vision indexing for PDF:
    1) render selected pages to images
    2) analyze each page with local vision model (Ollama)
    3) store page summaries in vector DB as additional 'vision' layer
    """
    from ingest import SOURCE_DIR
    try:
        file_path = os.path.join(SOURCE_DIR, filename)
        if not os.path.exists(file_path):
            return {"status": "error", "message": f"File '{filename}' not found on disk."}
        if not filename.lower().endswith(".pdf"):
            return {"status": "error", "message": "Vision indexing supports PDF files only."}

        settings = await sqlite_service.get_settings()
        vision_model = str(model or os.getenv("VISION_MODEL_OVERRIDE", "ollama:qwen3-vl:4b")).strip()
        if not vision_model.startswith("ollama:"):
            return {"status": "error", "message": "Vision model must be an Ollama model id (e.g. ollama:qwen3-vl:4b)."}

        rendered_pages, total_pages = render_pdf_pages_to_base64(file_path, max_pages=max_pages, scale=2.0)
        if not rendered_pages:
            return {"status": "error", "message": "No pages rendered for vision indexing."}

        await sqlite_service.add_log(
            "info",
            "KNOWLEDGE",
            f"Vision indexing started for '{filename}' ({len(rendered_pages)}/{total_pages} pages) via {vision_model}"
        )

        page_notes = []
        for page_obj in rendered_pages:
            page_num = page_obj["page"]
            image_b64 = page_obj["image_b64"]

            prompt = (
                f"Analyze page {page_num} of a technical PDF document.\n"
                "Return a concise factual extraction in Polish:\n"
                "1) key facts\n"
                "2) entities/concepts\n"
                "3) numbers/metrics if present\n"
                "4) a short summary\n"
                "Do not invent missing details."
            )
            page_answer = await _run_ollama_generate(
                model_id=vision_model,
                user_prompt=prompt,
                settings=settings,
                temperature=0.1,
                images=[image_b64],
                timeout_s=240.0,
            )
            page_notes.append(f"## Vision Page {page_num}\n{page_answer}")

        stats = os.stat(file_path)
        file_size = f"{round(stats.st_size / 1024, 1)} KB"
        merged_vision_text = (
            f"# VISION_LAYER\n"
            f"source: {filename}\n"
            f"model: {vision_model}\n"
            f"processed_pages: {len(page_notes)}/{total_pages}\n\n"
            + "\n\n".join(page_notes)
        )

        success = await process_content(
            merged_vision_text,
            filename,
            db_service,
            file_size,
            extra_metadata={
                "layer": "vision",
                "vision_model": vision_model,
                "vision_pages_processed": len(page_notes),
                "vision_total_pages": total_pages,
            },
        )
        if not success:
            return {"status": "error", "message": "Vision extraction completed, but indexing failed."}

        await sqlite_service.add_log(
            "success",
            "KNOWLEDGE",
            f"Vision indexed '{filename}' ({len(page_notes)}/{total_pages} pages) with {vision_model}"
        )
        return {
            "status": "success",
            "message": f"Vision indexing complete for '{filename}'.",
            "filename": filename,
            "model": vision_model,
            "processed_pages": len(page_notes),
            "total_pages": total_pages,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}





@app.get("/ping")
async def ping():
    return {"status": "success", "message": "pong", "version": "1.4.0"}

@app.get("/stats")
async def get_stats():
    """Returns database statistics for the dashboard."""
    stats = db_service.get_stats()
    
    # Calculate reliability from logs
    logs = await sqlite_service.get_logs(limit=100)
    if not logs:
        reliability = 100.0
    else:
        errors = len([l for l in logs if l["type"] == "error"])
        reliability = max(0, 100.0 - (errors / len(logs)) * 100.0)
    
    stats["reliability"] = round(reliability, 1)
    
    # Add session count
    sessions = await sqlite_service.get_sessions()
    stats["sessions_count"] = len(sessions)
    
    return {
        "status": "success",
        "stats": stats
    }

from config import get_config, write_config

class ConfigUpdate(BaseModel):
    GEMINI_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    MODEL_OVERRIDE: str = "gemini-3-flash"
    SYSTEM_LANGUAGE: str = "pl"

@app.get("/config")
async def read_configuration():
    """Returns the current backend configuration."""
    try:
        conf = get_config()
        # For security, we might want to mask keys, but since this is a local tool, we send them to the UI so it can edit them.
        return {"status": "success", "config": conf}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class CognitionSettings(BaseModel):
    persona: str = "Balanced"
    autonomy: int = 2
    creativity: int = 60
    reflection: bool = True
    circadian_lock: bool = False
    custom_directives: str = ""

@app.get("/cognition/settings")
async def get_cognition_settings():
    """Returns the current neural cognition settings."""
    settings = await sqlite_service.get_settings()
    return {
        "status": "success",
        "settings": {
            "persona": settings["COGNITION_PERSONA"],
            "autonomy": int(settings["COGNITION_AUTONOMY"]),
            "creativity": int(settings["COGNITION_CREATIVITY"]),
            "reflection": settings["COGNITION_REFLECTION"].lower() == "true",
            "circadian_lock": settings["COGNITION_CIRCADIAN_LOCK"].lower() == "true",
            "custom_directives": settings.get("COGNITION_CUSTOM_DIRECTIVES", "")
        }
    }

@app.post("/cognition/settings")
async def update_cognition_settings(settings: CognitionSettings):
    """Updates the neural cognition settings."""
    await sqlite_service.set_setting("COGNITION_PERSONA", settings.persona)
    await sqlite_service.set_setting("COGNITION_AUTONOMY", settings.autonomy)
    await sqlite_service.set_setting("COGNITION_CREATIVITY", settings.creativity)
    await sqlite_service.set_setting("COGNITION_REFLECTION", str(settings.reflection).lower())
    await sqlite_service.set_setting("COGNITION_CIRCADIAN_LOCK", str(settings.circadian_lock).lower())
    await sqlite_service.set_setting("COGNITION_CUSTOM_DIRECTIVES", settings.custom_directives)
    
    await sqlite_service.add_log("info", "CORE", f"Cognition calibration updated: persona={settings.persona}, autonomy={settings.autonomy}")
    
    return {"status": "success", "message": "Neural configuration committed successfully."}

@app.post("/config")
async def update_configuration(new_conf: ConfigUpdate):
    """Updates the .env configuration and reloads environment."""
    print(f"[Config] Received update request: {new_conf}")
    try:
        # Merge logic: preserve existing keys if new ones are empty/missing
        current_conf = get_config()
        updated_dict = {
            "GEMINI_API_KEY": new_conf.GEMINI_API_KEY or current_conf.get("GEMINI_API_KEY", ""),
            "TAVILY_API_KEY": new_conf.TAVILY_API_KEY or current_conf.get("TAVILY_API_KEY", ""),
            "QDRANT_URL": new_conf.QDRANT_URL or current_conf.get("QDRANT_URL", ""),
            "QDRANT_API_KEY": new_conf.QDRANT_API_KEY or current_conf.get("QDRANT_API_KEY", ""),
            "MODEL_OVERRIDE": new_conf.MODEL_OVERRIDE or current_conf.get("MODEL_OVERRIDE", "gemini-3-flash"),
            "SYSTEM_LANGUAGE": new_conf.SYSTEM_LANGUAGE or current_conf.get("SYSTEM_LANGUAGE", "pl")
        }
        success = write_config(updated_dict)
        if success:
            print("[Config] Successfully wrote to .env")
            # We would typically need to restart the app or reload the env in memory.
            # For now, relying on dotenv reload.
            import os
            from dotenv import load_dotenv
            load_dotenv(override=True)
            return {"status": "success", "message": "Configuration updated successfully."}
        else:
            return {"status": "error", "message": "Failed to write configuration."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ingest")
async def ingest_file(file: UploadFile = File(...)):
    """
    Endpoint to ingest a file (PDF, TXT, MD) into the knowledge base.
    """
    from ingest import SOURCE_DIR
    try:
        # Ensure directory exists
        os.makedirs(SOURCE_DIR, exist_ok=True)
        
        content = await file.read()
        file_path = os.path.join(SOURCE_DIR, file.filename)
        
        # Save to disk
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Return early after just saving
        await sqlite_service.add_log("info", "KNOWLEDGE", f"Saved new source file to disk: {file.filename}")
        return {"status": "success", "message": f"File '{file.filename}' uploaded successfully. Ready for manual indexing."}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/knowledge/{filename}")
async def delete_document(filename: str):
    """
    Deletes a document from the knowledge base by filename (DB + Disk).
    """
    from ingest import SOURCE_DIR
    try:
        # 1. Delete from DB
        db_success = db_service.delete_document(filename)
        
        # 2. Delete from Disk
        file_path = os.path.join(SOURCE_DIR, filename)
        disk_success = False
        if os.path.exists(file_path):
            os.remove(file_path)
            disk_success = True
            
        if db_success or disk_success:
            await sqlite_service.add_log("warning", "KNOWLEDGE", f"Deleted source: {filename}")
            return {"status": "success", "message": f"Document '{filename}' deleted from DB and Disk."}
        else:
            return {"status": "error", "message": "Failed to locate document for deletion."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/knowledge/index/{filename}")
async def index_existing_file(filename: str):
    """
    Indexes a file that already exists on disk into the vector database.
    """
    from ingest import SOURCE_DIR
    try:
        file_path = os.path.join(SOURCE_DIR, filename)
        if not os.path.exists(file_path):
            return {"status": "error", "message": f"File '{filename}' not found on disk."}
            
        stats = os.stat(file_path)
        file_size = f"{round(stats.st_size / 1024, 1)} KB"
        
        text_content = extract_text_from_file(file_path)
            
        success = await process_content(text_content, filename, db_service, file_size)
        
        if success:
            await sqlite_service.add_log("success", "KNOWLEDGE", f"Manually indexed existing source: {filename}")
            return {"status": "success", "message": f"File '{filename}' indexed successfully."}
        else:
            return {"status": "error", "message": "Failed to index content."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/knowledge/content/{filename}")
async def get_document_content(filename: str):
    """
    Retrieves the raw text content of a document from the disk.
    """
    from ingest import SOURCE_DIR
    try:
        file_path = os.path.join(SOURCE_DIR, filename)
        if not os.path.exists(file_path):
            return {"status": "error", "message": f"File '{filename}' not found on disk."}
            
        content = extract_text_from_file(file_path)
            
        return {"status": "success", "content": content}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/system/docs")
async def list_system_docs():
    """Lists documentation files from the /docs directory."""
    docs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs")
    try:
        files = []
        if os.path.exists(docs_path):
            for filename in os.listdir(docs_path):
                if filename.endswith(".md"):
                    files.append(filename)
        return {"status": "success", "docs": sorted(files)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/system/docs/content/{filename}")
async def get_system_doc_content(filename: str):
    """Retrieves content of a specific documentation file."""
    docs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs")
    try:
        file_path = os.path.join(docs_path, filename)
        if not os.path.exists(file_path):
            return {"status": "error", "message": "File not found."}
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"status": "success", "content": content}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/memories")
async def list_memories():
    """Returns a list of all memories."""
    try:
        memories = db_service.list_memories()
        return {"status": "success", "memories": memories}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    """Deletes a memory by its ID."""
    try:
        if db_service.delete_memory(memory_id):
            return {"status": "success", "message": f"Memory deleted."}
        else:
            return {"status": "error", "message": "Failed to delete memory."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/knowledge")
async def list_knowledge():
    """
    Returns a list of all documents, combining disk files and vector index status.
    """
    from ingest import SOURCE_DIR
    try:
        # 1. Get indexed docs from Vector DB
        indexed_docs = {doc["filename"]: doc for doc in db_service.list_documents()}
        
        # 2. Scan physical folder
        disk_files = []
        if os.path.exists(SOURCE_DIR):
            for filename in os.listdir(SOURCE_DIR):
                if filename.startswith('.'): continue
                
                path = os.path.join(SOURCE_DIR, filename)
                if os.path.isfile(path):
                    stats = os.stat(path)
                    
                    is_indexed = filename in indexed_docs
                    disk_files.append({
                        "filename": filename,
                        "status": "indexed" if is_indexed else "on_disk",
                        "size": f"{round(stats.st_size / 1024, 1)} KB",
                        "metadata": indexed_docs.get(filename, {}).get("metadata", {})
                    })
        
        return {"status": "success", "documents": disk_files}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/sessions")
async def list_sessions():
    """Returns all historic chat sessions."""
    try:
        sessions = await sqlite_service.get_sessions()
        return {"status": "success", "sessions": sessions}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/sessions")
async def create_new_session(request: dict = None):
    """Creates a fresh session context."""
    try:
        title = "New Conversation" if not request or "title" not in request else request["title"]
        session_id = await sqlite_service.create_session(title)
        return {"status": "success", "session_id": session_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/sessions/{session_id}/messages")
async def get_session_history(session_id: str):
    """Returns all messages of a specific session with real-time cleaning."""
    try:
        import re
        msgs = await sqlite_service.get_messages(session_id)
        
        # Retroactive cleaning: if there's any JSON/technical junk in old messages, clean it here
        cleaned_msgs = []
        for msg in msgs:
            content = msg.get("content", "")
            if msg["role"] == "assistant" and ("final_result" in content.lower() or "aetherresponse" in content.lower()):
                # Try to extract just the response part from the stringified object
                resp_match = re.search(r"response=['\"](.*?)['\"]", content, re.DOTALL)
                if resp_match:
                    msg["content"] = resp_match.group(1).strip()
                else:
                    # Generic cleanup for noise prefixes
                    msg["content"] = re.sub(r"^(final_result|aetherresponse|finalresult)[:\s]*", "", content, flags=re.IGNORECASE).strip().strip(")'\"")

            # Retroactive metadata cleanup for malformed tool badges
            metadata = msg.get("metadata") if isinstance(msg.get("metadata"), dict) else None
            if metadata and isinstance(metadata.get("used_tools"), list):
                cleaned_tools = []
                seen_pairs = set()
                for t in metadata["used_tools"]:
                    if not isinstance(t, dict):
                        continue
                    name = str(t.get("name", "")).strip()
                    detail = str(t.get("detail", "")).strip()
                    if not name:
                        continue
                    norm = name.lower()
                    # Drop output schema pseudo-tools and wrapper artifacts
                    if norm in {"final_result", "finalresult", "aetherresponse"}:
                        continue
                    # Drop obvious serialization artifacts (e.g. x2, {}, dict dumps)
                    if name in {"x2", "{}", "[]"} or name.startswith("{") or name.startswith("["):
                        continue
                    if detail.startswith("{'response'") or detail.startswith('{"response"'):
                        detail = name
                    pair = (name, detail or name)
                    if pair in seen_pairs:
                        continue
                    seen_pairs.add(pair)
                    cleaned_tools.append({"name": name, "detail": detail or name})
                metadata["used_tools"] = cleaned_tools if cleaned_tools else None
            cleaned_msgs.append(msg)
            
        return {"status": "success", "messages": cleaned_msgs}
    except Exception as e:
        return {"status": "error", "message": str(e)}

from datetime import datetime
import math

@app.get("/recent_activity")
async def get_recent_activity():
    """Returns a list of aggregated recent activities for the dashboard."""
    try:
        activities = []
        
        # 1. Fetch memories
        memories = db_service.list_memories()
        for mem in memories:
            timestamp = mem.get("timestamp")
            if not timestamp:
                continue
            try:
                # Handle potentially different ISO formats
                t_str = timestamp.replace("Z", "+00:00")
                if "." in t_str and t_str.endswith("+00:00"):
                    # Quick fix for python's strict iso parsing
                    t_obj = datetime.fromisoformat(t_str)
                else:
                    t_obj = datetime.fromisoformat(t_str)
                activities.append({
                    "type": "memory",
                    "text": f"Memory stored: '{mem['content'][:40]}...'",
                    "timestamp": t_obj
                })
            except Exception as e:
                pass

        # 2. Fetch Sessions
        sessions = await sqlite_service.get_sessions()
        for sess in sessions:
            updated_at = sess.get("updated_at")
            if not updated_at:
                continue
            try:
                # SQLite usually stores as '2023-10-24 12:34:56'
                t_str = updated_at.replace("Z", "").replace(" ", "T")
                t_obj = datetime.fromisoformat(t_str)
                activities.append({
                    "type": "chat",
                    "text": f"Chat session updated: {sess.get('title', 'Unknown')}",
                    "timestamp": t_obj
                })
            except Exception as e:
                pass
                
        # Sort descending by real datetime object
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
        formatted = []
        now = datetime.now()
        # Convert timezone-aware `now` if needed, but sqlite is usually naive UTC. Let's make `now` naive UTC to match.
        now_utc = datetime.utcnow()
        
        for a in activities[:8]:
            # Simple timedelta
            t_obj = a["timestamp"].replace(tzinfo=None) # Strip tz for simple diff
            diff = now_utc - t_obj
            sec = diff.total_seconds()
            
            # Formatting
            if sec < 0: sec = 0 # Prevent negative if clock skew
            if sec < 60:
                t_str = "just now"
            elif sec < 3600:
                t_str = f"{math.floor(sec/60)}m ago"
            elif sec < 86400:
                t_str = f"{math.floor(sec/3600)}h ago"
            else:
                t_str = f"{math.floor(sec/86400)}d ago"
                
            color_map = {
                "memory": "text-purple-400",
                "chat": "text-cyan-400",
            }
            icon_map = {
                "memory": "Brain",
                "chat": "MessageSquare"
            }
            
            formatted.append({
                "type": a["type"],
                "text": a["text"],
                "time": t_str,
                "color": color_map.get(a["type"], "text-white"),
                "icon": icon_map.get(a["type"], "Activity")
            })
            
        return {"status": "success", "activities": formatted}
    except Exception as e:
        print(f"Error fetching recent activity: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/logs")
async def get_system_logs(limit: int = 50, from_id: int = 0):
    """Returns the latest system execution logs."""
    try:
        logs = await sqlite_service.get_logs(limit=limit, from_id=from_id)
        return {"status": "success", "logs": logs}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/logs")
async def clear_system_logs():
    """Clears all system logs."""
    try:
        await sqlite_service.clear_logs()
        await sqlite_service.add_log("info", "CORE", "System logs cleared by user request.")
        return {"status": "success", "message": "Logs cleared."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/system/clear")
async def clear_system_database():
    """Clears all system knowledge and history (concepts, links, sessions, logs, and vector memory)."""
    try:
        # Clear SQLite (Graph, Sessions, Logs)
        await sqlite_service.clear_database()
        
        # Clear Qdrant (Memories, Documents)
        db_service.clear_all()
        
        await sqlite_service.add_log("success", "CORE", "Full system purge executed. All databases cleared.")
        return {"status": "success", "message": "System fully purged and ready for fresh start."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/graph")
async def get_concept_graph():
    """Returns the concept constellation graph."""
    try:
        graph = await sqlite_service.get_concept_graph()
        return {"status": "success", "graph": graph}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/sessions/{session_id}")
async def delete_session_record(session_id: str):
    try:
        await sqlite_service.delete_session(session_id)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error"}

from pydantic_ai.messages import ModelMessagesTypeAdapter

@app.post("/actions/approve")
async def approve_action(request: ActionApproval):
    action = pending_actions.get(request.action_id)
    if not action or action["status"] != "pending":
        return {"status": "error", "message": "Action not found or already processed."}
    
    if not request.approved:
        action["status"] = "rejected"
        return {"status": "success", "message": "Action rejected."}
        
    try:
        if action["type"] == "write_file":
            # Write the file securely
            target_path = action["path"]
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(action["content"])
            action["status"] = "completed"
            return {"status": "success", "message": f"Successfully wrote to {action['display_path']}"}
        
        return {"status": "error", "message": "Unknown action type."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

from sleep_cycle import run_sleep_cycle

@app.get("/system/morning-brief")
async def get_morning_brief():
    """Fetches the latest Morning Brief from the database."""
    try:
        from local_db import sqlite_service
        import json
        
        # Pobierz logi uzywajac istniejacej funkcji serwisu i znajdz raport
        logs = await sqlite_service.get_logs(limit=200)
        for log in logs:
            if log["type"] == "brief":
                return {"status": "success", "report": json.loads(log["message"])}
                    
        return {
            "status": "success", 
            "report": {
                "brief": "Aether Core zaktualizowany. Brak ostatnich raportów z cyklu nocnego (Sleep Cycle). Uruchom ręcznie z kokpitu.",
                "points": ["System działa w trybie ciągłym.", "Naciśnij 'Force Sleep Cycle' aby zasymulować nową konsolidację."]
            }
        }
    except Exception as e:
        return {"status": "error", "message": f"Nie udało się załadować wczesnego raportu: {e}"}

@app.post("/system/sleep-cycle")
async def force_sleep_cycle():
    """Forces the Night Cycle processing to generate a new Morning Brief."""
    try:
        result = await run_sleep_cycle()
        return {"status": "success", "report": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/system/simulate")
async def force_awm_simulation():
    """Forces the Active World Model (AWM) to simulate and reflect on recent logs."""
    try:
        from world_model import run_active_world_model_simulation
        result = await run_active_world_model_simulation()
        return {"status": "success", "insight": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/cron/tasks")
async def list_cron_tasks():
    try:
        tasks = await cron_service.list_tasks()
        return {"status": "success", "tasks": tasks}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/skills")
async def list_agent_skills():
    """Returns all saved agent skills."""
    try:
        runtime_modes = await _get_skill_runtime_modes()
        skills = await sqlite_service.list_agent_skills()
        enriched = []
        for skill in skills:
            item = dict(skill)
            item.pop("enabled", None)
            runtime = runtime_modes.get(str(item.get("id", "")), {})
            item["agent_enabled"] = bool(runtime.get("agent_enabled", True))
            item["cron_enabled"] = bool(runtime.get("cron_enabled", True))
            item["markdown_path"] = _upsert_skill_markdown_file(item)
            enriched.append(item)
        return {"status": "success", "skills": enriched}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/skills")
async def create_agent_skill(request: SkillCreate):
    """Creates a new agent skill."""
    try:
        if not request.name.strip():
            return {"status": "error", "message": "Skill name is required."}
        if not request.instructions.strip():
            return {"status": "error", "message": "Skill instructions are required."}

        skill = await sqlite_service.create_agent_skill(
            name=request.name.strip(),
            purpose=(request.purpose or "").strip(),
            triggers=(request.triggers or "").strip(),
            instructions=request.instructions.strip(),
            enabled=True
        )
        await _set_skill_runtime_mode(str(skill.get("id", "")), agent_enabled=True, cron_enabled=True)
        skill["markdown_path"] = _upsert_skill_markdown_file(skill)
        await sqlite_service.add_log("info", "CORE", f"Created agent skill: {skill['name']}")
        return {"status": "success", "skill": skill}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.put("/skills/{skill_id}")
async def update_agent_skill(skill_id: str, request: SkillUpdate):
    """Updates an existing skill."""
    try:
        if not request.name.strip():
            return {"status": "error", "message": "Skill name is required."}
        if not request.instructions.strip():
            return {"status": "error", "message": "Skill instructions are required."}

        skill = await sqlite_service.update_agent_skill(
            skill_id=skill_id,
            name=request.name.strip(),
            purpose=(request.purpose or "").strip(),
            triggers=(request.triggers or "").strip(),
            instructions=request.instructions.strip(),
            enabled=True,
        )
        if not skill:
            return {"status": "error", "message": "Skill not found."}
        skill["markdown_path"] = _upsert_skill_markdown_file(skill)
        await sqlite_service.add_log("info", "CORE", f"Updated agent skill: {skill['name']}")
        return {"status": "success", "skill": skill}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/skills/{skill_id}/runtime")
async def update_agent_skill_runtime(skill_id: str, request: SkillRuntimeUpdate):
    """Updates runtime usage flags for an existing skill."""
    try:
        skill = await sqlite_service.get_agent_skill(skill_id)
        if not skill:
            return {"status": "error", "message": "Skill not found."}
        await _set_skill_runtime_mode(
            skill_id=skill_id,
            agent_enabled=bool(request.agent_enabled),
            cron_enabled=bool(request.cron_enabled),
        )
        return {
            "status": "success",
            "runtime": {
                "skill_id": skill_id,
                "agent_enabled": bool(request.agent_enabled),
                "cron_enabled": bool(request.cron_enabled),
            },
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/skills/{skill_id}")
async def delete_agent_skill(skill_id: str):
    """Deletes a skill by id."""
    try:
        root = _skills_library_root()
        root.mkdir(parents=True, exist_ok=True)
        for stale in root.glob(f"{skill_id}_*.md"):
            try:
                stale.unlink()
            except Exception:
                pass
        await _delete_skill_runtime_mode(skill_id)
        removed = await sqlite_service.delete_agent_skill(skill_id)
        if not removed:
            return {"status": "error", "message": "Skill not found."}
        return {"status": "success", "deleted": skill_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/skills/{skill_id}/markdown")
async def get_skill_markdown(skill_id: str):
    """Returns markdown content for a specific skill file."""
    try:
        skill = await sqlite_service.get_agent_skill(skill_id)
        if not skill:
            return {"status": "error", "message": "Skill not found."}

        rel_path = _upsert_skill_markdown_file(skill)
        full_path = (Path(__file__).resolve().parent.parent / rel_path).resolve()
        content = full_path.read_text(encoding="utf-8")
        return {"status": "success", "path": rel_path, "content": content}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def _skills_templates_root() -> Path:
    return Path(__file__).resolve().parent.parent / "workspace" / "skills" / "templates"

async def _get_skill_runtime_modes() -> dict:
    settings = await sqlite_service.get_settings()
    raw = str(settings.get("SKILL_RUNTIME_MODES", "{}"))
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}

async def _set_skill_runtime_mode(skill_id: str, agent_enabled: bool, cron_enabled: bool) -> None:
    if not skill_id:
        return
    current = await _get_skill_runtime_modes()
    current[str(skill_id)] = {
        "agent_enabled": bool(agent_enabled),
        "cron_enabled": bool(cron_enabled),
    }
    await sqlite_service.set_setting("SKILL_RUNTIME_MODES", json.dumps(current, ensure_ascii=False))

async def _delete_skill_runtime_mode(skill_id: str) -> None:
    current = await _get_skill_runtime_modes()
    if str(skill_id) in current:
        del current[str(skill_id)]
        await sqlite_service.set_setting("SKILL_RUNTIME_MODES", json.dumps(current, ensure_ascii=False))

def _skills_library_root() -> Path:
    return Path(__file__).resolve().parent.parent / "workspace" / "skills" / "library"

def _skill_markdown_basename(skill: dict) -> str:
    raw_name = str(skill.get("name", "skill")).strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw_name).strip("-")
    if not slug:
        slug = "skill"
    return f"{str(skill.get('id', 'skill'))}_{slug}.md"

def _render_skill_markdown(skill: dict) -> str:
    return (
        "---\n"
        f"id: {str(skill.get('id', ''))}\n"
        f"name: {str(skill.get('name', ''))}\n"
        f"purpose: {str(skill.get('purpose', '')).replace(chr(10), ' ').strip()}\n"
        f"triggers: {str(skill.get('triggers', ''))}\n"
        "---\n\n"
        f"{str(skill.get('instructions', '')).strip()}\n"
    )

def _upsert_skill_markdown_file(skill: dict) -> str:
    root = _skills_library_root()
    root.mkdir(parents=True, exist_ok=True)

    skill_id = str(skill.get("id", "")).strip()
    if skill_id:
        for stale in root.glob(f"{skill_id}_*.md"):
            try:
                stale.unlink()
            except Exception:
                pass

    target = root / _skill_markdown_basename(skill)
    target.write_text(_render_skill_markdown(skill), encoding="utf-8")
    return target.relative_to(Path(__file__).resolve().parent.parent).as_posix()

def _parse_skill_template_file(content: str, fallback_name: str) -> dict:
    name = fallback_name
    purpose = ""
    triggers = ""
    instructions = content.strip()

    raw = content.strip()
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        # Expected: "", "<meta>", "<body>"
        if len(parts) == 3:
            meta_block = parts[1]
            body = parts[2].strip()
            meta: dict[str, str] = {}
            for line in meta_block.splitlines():
                if ":" not in line:
                    continue
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip()
            name = meta.get("name", name) or name
            purpose = meta.get("purpose", "")
            triggers = meta.get("triggers", "")
            instructions = body if body else instructions

    return {
        "name": name,
        "purpose": purpose,
        "triggers": triggers,
        "instructions": instructions,
    }

@app.get("/skills/templates")
async def list_skill_templates():
    """Lists skill templates from workspace/skills/templates."""
    root = _skills_templates_root()
    try:
        root.mkdir(parents=True, exist_ok=True)
        templates = []
        for file_path in sorted(root.glob("*.md")):
            raw = file_path.read_text(encoding="utf-8")
            parsed = _parse_skill_template_file(raw, file_path.stem.replace("_", " ").title())
            templates.append(
                {
                    "filename": file_path.name,
                    "name": parsed["name"],
                    "purpose": parsed["purpose"],
                    "triggers": parsed["triggers"],
                    "preview": (parsed["instructions"][:180] + "...") if len(parsed["instructions"]) > 180 else parsed["instructions"],
                }
            )
        return {"status": "success", "templates": templates}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/skills/templates/apply")
async def apply_skill_template(request: SkillTemplateApplyRequest):
    """Loads one template file and returns fields ready for skill creation form."""
    root = _skills_templates_root()
    try:
        root.mkdir(parents=True, exist_ok=True)
        filename = Path(request.filename).name
        candidate = (root / filename).resolve()
        if not candidate.exists() or not candidate.is_file():
            return {"status": "error", "message": "Template not found."}
        if root.resolve() not in candidate.parents and candidate != root.resolve():
            return {"status": "error", "message": "Invalid template path."}

        raw = candidate.read_text(encoding="utf-8")
        parsed = _parse_skill_template_file(raw, candidate.stem.replace("_", " ").title())
        return {"status": "success", "template": {"filename": filename, **parsed}}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/cron/jobs")
async def list_cron_jobs():
    try:
        jobs = await cron_service.list_jobs()
        return {"status": "success", "jobs": jobs}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/cron/jobs")
async def upsert_cron_job(request: CronJobUpsert):
    try:
        job = await cron_service.upsert_job(request.model_dump())
        return {"status": "success", "job": job}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/cron/jobs/{job_id}/toggle")
async def toggle_cron_job(job_id: str, request: CronToggle):
    try:
        job = await cron_service.toggle_job(job_id, request.enabled)
        if not job:
            return {"status": "error", "message": "Cron job not found."}
        return {"status": "success", "job": job}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/cron/jobs/{job_id}/run")
async def run_cron_job_now(job_id: str):
    try:
        job = await cron_service.run_now(job_id)
        if not job:
            return {"status": "error", "message": "Cron job not found."}
        return {"status": "success", "job": job}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.delete("/cron/jobs/{job_id}")
async def delete_cron_job(job_id: str):
    try:
        removed = await cron_service.delete_job(job_id)
        if not removed:
            return {"status": "error", "message": "Cron job not found."}
        return {"status": "success", "message": "Cron job deleted."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/workspace/files")
async def list_workspace_files():
    """Lists files from the /workspace directory recursively."""
    workspace_root = Path(__file__).resolve().parent.parent / "workspace"
    try:
        files = []
        if workspace_root.exists():
            for file_path in workspace_root.rglob("*"):
                if not file_path.is_file():
                    continue
                rel = file_path.relative_to(workspace_root).as_posix()
                stat = file_path.stat()
                files.append({
                    "path": rel,
                    "size_bytes": stat.st_size,
                    "size": f"{round(stat.st_size / 1024, 1)} KB",
                    "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                    "extension": file_path.suffix.lower(),
                })
        files.sort(key=lambda item: item["path"].lower())
        return {"status": "success", "files": files}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/workspace/upload")
async def upload_workspace_file(file: UploadFile = File(...)):
    """Uploads a file directly into /workspace."""
    workspace_root = Path(__file__).resolve().parent.parent / "workspace"
    try:
        safe_name = Path(file.filename or "").name
        if not safe_name:
            return {"status": "error", "message": "Invalid filename."}

        workspace_root.mkdir(parents=True, exist_ok=True)
        target = workspace_root / safe_name
        content = await file.read()
        with open(target, "wb") as f:
            f.write(content)

        await sqlite_service.add_log("info", "WORKSPACE", f"Uploaded workspace file: {safe_name}")
        return {"status": "success", "message": f"File '{safe_name}' uploaded.", "path": safe_name}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/workspace/content")
async def get_workspace_file_content(path: str):
    """Returns raw text content of a file inside /workspace."""
    workspace_root = Path(__file__).resolve().parent.parent / "workspace"
    try:
        if not path or not path.strip():
            return {"status": "error", "message": "Query parameter 'path' is required."}

        candidate = (workspace_root / path).resolve()
        root_resolved = workspace_root.resolve()
        if root_resolved not in candidate.parents and candidate != root_resolved:
            return {"status": "error", "message": "Invalid path."}
        if not candidate.exists() or not candidate.is_file():
            return {"status": "error", "message": "File not found."}

        # Best-effort text read for notes/reports generated by the agent.
        with open(candidate, "r", encoding="utf-8") as f:
            content = f.read()

        return {"status": "success", "path": candidate.relative_to(root_resolved).as_posix(), "content": content}
    except UnicodeDecodeError:
        return {"status": "error", "message": "Binary file preview is not supported."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/workspace/content")
async def delete_workspace_file(path: str):
    """Deletes a file inside /workspace."""
    workspace_root = Path(__file__).resolve().parent.parent / "workspace"
    try:
        if not path or not path.strip():
            return {"status": "error", "message": "Query parameter 'path' is required."}

        candidate = (workspace_root / path).resolve()
        root_resolved = workspace_root.resolve()
        if root_resolved not in candidate.parents and candidate != root_resolved:
            return {"status": "error", "message": "Invalid path."}
        if not candidate.exists() or not candidate.is_file():
            return {"status": "error", "message": "File not found."}

        candidate.unlink()
        await sqlite_service.add_log("warning", "WORKSPACE", f"Deleted workspace file: {candidate.relative_to(root_resolved).as_posix()}")
        return {"status": "success", "message": "File deleted."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/social/tweet-drafts")
async def list_tweet_drafts(limit: int = 10):
    try:
        settings = await sqlite_service.get_settings()
        raw = settings.get("SOCIAL_TWEET_DRAFTS", "[]")
        drafts = json.loads(raw) if isinstance(raw, str) else []
        if not isinstance(drafts, list):
            drafts = []
        safe_limit = max(1, min(int(limit), 50))
        return {"status": "success", "drafts": drafts[:safe_limit]}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    from pydantic_ai.messages import ModelMessagesTypeAdapter
    from pydantic_ai import ModelSettings
    from agent import create_model_instance, get_current_model_name, is_ollama_model

    async def stream():
        def emit(payload: dict):
            safe_payload = jsonable_encoder(payload)
            return (json.dumps(safe_payload, ensure_ascii=False) + "\n").encode("utf-8")

        try:
            history = None
            if request.message_history:
                history = ModelMessagesTypeAdapter.validate_python(request.message_history)

            # Load cognition settings for runtime behavior.
            settings = await sqlite_service.get_settings()
            persona = settings.get("COGNITION_PERSONA", "Balanced")
            autonomy = int(settings.get("COGNITION_AUTONOMY", 2))
            creativity = int(settings.get("COGNITION_CREATIVITY", 60))
            reflection = str(settings.get("COGNITION_REFLECTION", "true")).lower() == "true"
            circadian_lock = str(settings.get("COGNITION_CIRCADIAN_LOCK", "false")).lower() == "true"
            custom_directives = settings.get("COGNITION_CUSTOM_DIRECTIVES", "")
            temp = max(0.0, min(1.0, creativity / 100.0))

            request_source = (request.source or "dashboard").strip().lower()
            run_kwargs = {
                "user_prompt": request.message,
                "deps": {
                    "user_message": request.message,
                    "search_count": 0,
                    "persona": persona,
                    "autonomy": autonomy,
                    "reflection": reflection,
                    "circadian_lock": circadian_lock,
                    "custom_directives": custom_directives,
                    "source": request_source,
                },
                "model_settings": ModelSettings(temperature=temp),
            }
            if history:
                run_kwargs["message_history"] = history

            # Dynamic Model Loading
            # Priority: Request parameter > Environment Config
            selected_model_id = request.model if request.model and request.model != "gemini" else get_current_model_name()

            # Backward compatibility for 'ollama' toggle in generic chat UI
            if selected_model_id == "ollama":
                selected_model_id = "ollama:llama3.2"

            # Stable fallback for local SLMs (bypasses tool orchestration that some Ollama models struggle with).
            if is_ollama_model(selected_model_id):
                await sqlite_service.add_log("info", "LLM", f"Ollama fallback stream: model={selected_model_id}")
                yield emit({"type": "status", "message": f"Ollama local generation: model={selected_model_id}"})

                final_answer = await _run_ollama_generate(
                    model_id=selected_model_id,
                    user_prompt=request.message,
                    settings=settings,
                    temperature=temp,
                )

                active_session_id = request.session_id
                if not active_session_id:
                    title = request.message[:30] + "..." if len(request.message) > 30 else request.message
                    active_session_id = await sqlite_service.create_session(title=title)

                await sqlite_service.add_message(
                    session_id=active_session_id,
                    role="user",
                    content=request.message
                )

                await sqlite_service.add_message(
                    session_id=active_session_id,
                    role="assistant",
                    content=final_answer,
                    metadata={
                        "internal_thought": f"[Model: {selected_model_id}] Conf: 0.72 | Reason: LOCAL_SLM",
                        "confidence": 0.72,
                        "reasoning": "LOCAL_SLM",
                        "used_tools": None,
                        "active_skills": None
                    }
                )

                yield emit({
                    "type": "final",
                    "data": {
                        "status": "success",
                        "session_id": active_session_id,
                        "response": final_answer,
                        "confidence": 0.72,
                        "reasoning": "LOCAL_SLM",
                        "internal_thought": f"[Model: {selected_model_id}] Conf: 0.72 | Reason: LOCAL_SLM",
                        "new_messages": [],
                        "pending_actions": [],
                        "active_skills": []
                    }
                })
                return

            active_model = create_model_instance(selected_model_id)
            run_kwargs["model"] = active_model

            await sqlite_service.add_log("info", "LLM", f"Agent stream initiated: model={selected_model_id}")
            yield emit({"type": "status", "message": f"Agent call initiated: model={selected_model_id}"})

            result = None
            async for event in aether_agent.run_stream_events(**run_kwargs):
                event_kind = getattr(event, "event_kind", "")

                if event_kind == "part_start":
                    part = getattr(event, "part", None)
                    part_kind = getattr(part, "part_kind", "")
                    if part_kind == "text":
                        text_chunk = getattr(part, "content", "")
                        if text_chunk:
                            yield emit({"type": "token", "content": str(text_chunk)})

                if event_kind == "part_delta":
                    delta = getattr(event, "delta", None)
                    delta_kind = getattr(delta, "part_delta_kind", "")
                    if delta_kind == "text":
                        text_chunk = getattr(delta, "content_delta", "")
                        if text_chunk:
                            yield emit({"type": "token", "content": str(text_chunk)})

                if event_kind == "function_tool_call":
                    part = getattr(event, "part", None)
                    tool_name = getattr(part, "tool_name", None)
                    if tool_name:
                        args = {}
                        raw_args = getattr(part, "args", None)
                        if isinstance(raw_args, dict):
                            args = raw_args
                        elif isinstance(raw_args, str):
                            try:
                                parsed_args = json.loads(raw_args)
                                if isinstance(parsed_args, dict):
                                    args = parsed_args
                            except Exception:
                                args = {}
                        yield emit({
                            "type": "tool_call",
                            "tool_name": str(tool_name),
                            "args": args
                        })

                if event_kind == "agent_run_result":
                    result = event.result

            if result is None:
                yield emit({"type": "error", "message": "Agent stream finished without final result."})
                return

            # ROBUST EXTRACTION: Get clean data regardless of Pydantic-AI internal state or model quirks
            data_out = result.output
            final_answer = ""
            confidence = 0.95
            reasoning = "GENERAL"

            # 1. Try to extract from structured model or dict
            if hasattr(data_out, "response"):
                final_answer = data_out.response
                confidence = getattr(data_out, "confidence_score", 0.95)
                reasoning = getattr(data_out, "reasoning_type", "GENERAL")
            elif isinstance(data_out, dict):
                final_answer = data_out.get("response", "")
                confidence = data_out.get("confidence_score", 0.95)
                reasoning = data_out.get("reasoning_type", "GENERAL")

            # 2. Fallback: If it's a string, it might be a raw message or a stringified object
            if not final_answer:
                raw_str = str(data_out)

                # Try to find JSON-like structure in the string
                json_match = re.search(r"\{.*\}", raw_str, re.DOTALL)
                if json_match:
                    try:
                        parsed = json.loads(json_match.group(0))
                        if isinstance(parsed, dict):
                            final_answer = parsed.get("response", "")
                            confidence = parsed.get("confidence_score", 0.95)
                            reasoning = parsed.get("reasoning_type", "GENERAL")
                    except Exception:
                        pass

                # If still no answer, try regex for response="..."
                if not final_answer:
                    resp_match = re.search(r"response=['\"](.*?)['\"]", raw_str, re.DOTALL)
                    if resp_match:
                        final_answer = resp_match.group(1)
                    else:
                        # Final fallback: just use the raw string but clean it
                        final_answer = raw_str

            # 3. AGGRESSIVE CLEANING: Strip technical noise
            noise_prefixes = ["final_result", "FinalResult", "AetherResponse", "x2"]
            for prefix in noise_prefixes:
                if final_answer.lstrip().startswith(prefix):
                    final_answer = re.sub(rf"^{prefix}[:\s]*", "", final_answer, flags=re.IGNORECASE)
                final_answer = re.sub(rf"{prefix}\(", "", final_answer, flags=re.IGNORECASE)

            final_answer = final_answer.strip().strip(")'\"")

            if not final_answer:
                final_answer = "System was unable to format a response. Technical output: " + str(data_out)

            internal_thought = f"[Model: {selected_model_id}] Conf: {confidence} | Reason: {reasoning}"

            # Determine Session (Create if none)
            active_session_id = request.session_id
            if not active_session_id:
                title = request.message[:30] + "..." if len(request.message) > 30 else request.message
                active_session_id = await sqlite_service.create_session(title=title)

            # Save User Message
            await sqlite_service.add_message(
                session_id=active_session_id,
                role="user",
                content=request.message
            )

            current_pending = [
                {"id": k, **v} for k, v in pending_actions.items() if v["status"] == "pending"
            ]
            active_skills = []
            try:
                deps_obj = run_kwargs.get("deps", {})
                raw_skills = deps_obj.get("active_skills", []) if isinstance(deps_obj, dict) else []
                if isinstance(raw_skills, list):
                    active_skills = raw_skills
            except Exception:
                active_skills = []

            # Serialize messages to load into the frontend Context
            serialized_messages = ModelMessagesTypeAdapter.dump_python(result.new_messages())

            # Save AI Response
            ai_meta = {
                "internal_thought": internal_thought,
                "pendingActions": current_pending if current_pending else None,
                "confidence": confidence,
                "reasoning": reasoning,
                "used_tools": [],
                "active_skills": active_skills if active_skills else None
            }

            # Parse used tools from serialized messages (tool-call parts only).
            used_tools = []
            seen_pairs = set()
            try:
                for m in serialized_messages:
                    parts = m.get("parts", []) if isinstance(m, dict) else []
                    for p in parts:
                        if isinstance(p, dict) and p.get("part_kind") == "tool-call" and p.get("tool_name"):
                            tool_name = str(p.get("tool_name")).strip()
                            norm_name = tool_name.lower()
                            if norm_name in {"final_result", "finalresult", "aetherresponse"}:
                                continue
                            args = p.get("args", {})
                            detail = ""
                            if isinstance(args, dict):
                                detail = args.get("path") or args.get("query") or args.get("name") or tool_name
                            else:
                                detail = tool_name

                            if tool_name:
                                pair = (tool_name, str(detail))
                                if pair in seen_pairs:
                                    continue
                                seen_pairs.add(pair)
                                used_tools.append({
                                    "name": tool_name,
                                    "detail": str(detail),
                                })
            except Exception:
                pass

            ai_meta["used_tools"] = used_tools if used_tools else None

            await sqlite_service.add_message(
                session_id=active_session_id,
                role="assistant",
                content=final_answer,
                metadata=ai_meta
            )

            yield emit({
                "type": "final",
                "data": {
                    "status": "success",
                    "session_id": active_session_id,
                    "response": final_answer,
                    "confidence": confidence,
                    "reasoning": reasoning,
                    "internal_thought": internal_thought,
                    "new_messages": serialized_messages,
                    "pending_actions": current_pending,
                    "active_skills": active_skills
                }
            })
        except Exception as e:
            yield emit({"type": "error", "message": str(e)})

    return StreamingResponse(
        stream(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        from pydantic_ai.messages import ModelMessagesTypeAdapter
        from pydantic_ai import ModelSettings
        from agent import create_model_instance, get_current_model_name, is_ollama_model
        
        history = None
        if request.message_history:
            history = ModelMessagesTypeAdapter.validate_python(request.message_history)

        # Load cognition settings for runtime behavior.
        settings = await sqlite_service.get_settings()
        persona = settings.get("COGNITION_PERSONA", "Balanced")
        autonomy = int(settings.get("COGNITION_AUTONOMY", 2))
        creativity = int(settings.get("COGNITION_CREATIVITY", 60))
        reflection = str(settings.get("COGNITION_REFLECTION", "true")).lower() == "true"
        circadian_lock = str(settings.get("COGNITION_CIRCADIAN_LOCK", "false")).lower() == "true"
        custom_directives = settings.get("COGNITION_CUSTOM_DIRECTIVES", "")
        temp = max(0.0, min(1.0, creativity / 100.0))
            
        request_source = (request.source or "dashboard").strip().lower()
        run_kwargs = {
            "user_prompt": request.message,
            "deps": {
                "user_message": request.message,
                "search_count": 0,
                "persona": persona,
                "autonomy": autonomy,
                "reflection": reflection,
                "circadian_lock": circadian_lock,
                "custom_directives": custom_directives,
                "source": request_source,
            },
            "model_settings": ModelSettings(temperature=temp),
        }
        if history:
            run_kwargs["message_history"] = history

        # Dynamic Model Loading
        # Priority: Request parameter > Environment Config
        selected_model_id = request.model if request.model and request.model != "gemini" else get_current_model_name()
        
        # Backward compatibility for 'ollama' toggle in generic chat UI
        if selected_model_id == "ollama":
            selected_model_id = "ollama:llama3.2"

        # Stable fallback for local SLMs (bypasses tool orchestration that some Ollama models struggle with).
        if is_ollama_model(selected_model_id):
            await sqlite_service.add_log("info", "LLM", f"Ollama fallback call: model={selected_model_id}")
            final_answer = await _run_ollama_generate(
                model_id=selected_model_id,
                user_prompt=request.message,
                settings=settings,
                temperature=temp,
            )

            active_session_id = request.session_id
            if not active_session_id:
                title = request.message[:30] + "..." if len(request.message) > 30 else request.message
                active_session_id = await sqlite_service.create_session(title=title)

            await sqlite_service.add_message(
                session_id=active_session_id,
                role="user",
                content=request.message
            )
            await sqlite_service.add_message(
                session_id=active_session_id,
                role="assistant",
                content=final_answer,
                metadata={
                    "internal_thought": f"[Model: {selected_model_id}] Conf: 0.72 | Reason: LOCAL_SLM",
                    "confidence": 0.72,
                    "reasoning": "LOCAL_SLM",
                    "used_tools": None,
                    "active_skills": None
                }
            )

            return {
                "status": "success",
                "session_id": active_session_id,
                "response": final_answer,
                "confidence": 0.72,
                "reasoning": "LOCAL_SLM",
                "internal_thought": f"[Model: {selected_model_id}] Conf: 0.72 | Reason: LOCAL_SLM",
                "new_messages": [],
                "pending_actions": [],
                "active_skills": []
            }

        active_model = create_model_instance(selected_model_id)
        run_kwargs["model"] = active_model
            
        await sqlite_service.add_log("info", "LLM", f"Agent call initiated: model={selected_model_id}")
        result = await aether_agent.run(**run_kwargs)
        
        # ROBUST EXTRACTION: Get clean data regardless of Pydantic-AI internal state or model quirks
        # In pydantic-ai v1.x, .data contains the structured result
        data_out = result.output
        final_answer = ""
        confidence = 0.95
        reasoning = "GENERAL"

        # 1. Try to extract from structured model or dict
        if hasattr(data_out, "response"):
            final_answer = data_out.response
            confidence = getattr(data_out, "confidence_score", 0.95)
            reasoning = getattr(data_out, "reasoning_type", "GENERAL")
        elif isinstance(data_out, dict):
            final_answer = data_out.get("response", "")
            confidence = data_out.get("confidence_score", 0.95)
            reasoning = data_out.get("reasoning_type", "GENERAL")
        
        # 2. Fallback: If it's a string, it might be a raw message or a stringified object
        if not final_answer:
            raw_str = str(data_out)
            # Check if it looks like a stringified AetherResponse or dictionary
            import json
            
            # Try to find JSON-like structure in the string
            json_match = re.search(r'\{.*\}', raw_str, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(0))
                    if isinstance(parsed, dict):
                        final_answer = parsed.get("response", "")
                        confidence = parsed.get("confidence_score", 0.95)
                        reasoning = parsed.get("reasoning_type", "GENERAL")
                except:
                    pass
            
            # If still no answer, try regex for response="..."
            if not final_answer:
                resp_match = re.search(r"response=['\"](.*?)['\"]", raw_str, re.DOTALL)
                if resp_match:
                    final_answer = resp_match.group(1)
                else:
                    # Final fallback: just use the raw string but clean it
                    final_answer = raw_str
        
        # 3. AGGRESSIVE CLEANING: Strip technical noise
        noise_prefixes = ["final_result", "FinalResult", "AetherResponse", "x2"]
        for prefix in noise_prefixes:
            # Remove from start if exists
            if final_answer.lstrip().startswith(prefix):
                final_answer = re.sub(rf"^{prefix}[:\s]*", "", final_answer, flags=re.IGNORECASE)
            # Remove anywhere if it looks like a function call
            final_answer = re.sub(rf"{prefix}\(", "", final_answer, flags=re.IGNORECASE)
            
        final_answer = final_answer.strip().strip(")'\"")
        
        if not final_answer:
            final_answer = "System was unable to format a response. Technical output: " + str(data_out)
        
        internal_thought = f"[Model: {selected_model_id}] Conf: {confidence} | Reason: {reasoning}"
        
        # Determine Session (Create if none)
        active_session_id = request.session_id
        if not active_session_id:
            title = request.message[:30] + "..." if len(request.message) > 30 else request.message
            active_session_id = await sqlite_service.create_session(title=title)
        
        # Save User Message
        await sqlite_service.add_message(
            session_id=active_session_id,
            role="user",
            content=request.message
        )

        current_pending = [
            {"id": k, **v} for k, v in pending_actions.items() if v["status"] == "pending"
        ]
        active_skills = []
        try:
            deps_obj = run_kwargs.get("deps", {})
            raw_skills = deps_obj.get("active_skills", []) if isinstance(deps_obj, dict) else []
            if isinstance(raw_skills, list):
                active_skills = raw_skills
        except Exception:
            active_skills = []
        
        # Serialize messages to load into the frontend Context
        serialized_messages = ModelMessagesTypeAdapter.dump_python(result.new_messages())

        # Save AI Response
        ai_meta = {
            "internal_thought": internal_thought,
            "pendingActions": current_pending if current_pending else None,
            "confidence": confidence,
            "reasoning": reasoning,
            "used_tools": [],
            "active_skills": active_skills if active_skills else None
        }
        
        # Parse used tools from serialized messages (tool-call parts only).
        # This avoids persisting tool-return payloads like `final_result({...})`
        # as UI badges.
        used_tools = []
        seen_pairs = set()
        try:
            for m in serialized_messages:
                parts = m.get("parts", []) if isinstance(m, dict) else []
                for p in parts:
                    if isinstance(p, dict) and p.get("part_kind") == "tool-call" and p.get("tool_name"):
                        tool_name = str(p.get("tool_name")).strip()
                        norm_name = tool_name.lower()
                        if norm_name in {"final_result", "finalresult", "aetherresponse"}:
                            continue
                        args = p.get("args", {})
                        detail = ""
                        if isinstance(args, dict):
                            detail = args.get("path") or args.get("query") or args.get("name") or tool_name
                        else:
                            detail = tool_name

                        if tool_name:
                            pair = (tool_name, str(detail))
                            if pair in seen_pairs:
                                continue
                            seen_pairs.add(pair)
                            used_tools.append({
                                "name": tool_name,
                                "detail": str(detail),
                            })
        except Exception:
            pass
            
        ai_meta["used_tools"] = used_tools if used_tools else None
        
        await sqlite_service.add_message(
            session_id=active_session_id,
            role="assistant",
            content=final_answer,
            metadata=ai_meta
        )

        return {
            "status": "success",
            "session_id": active_session_id,
            "response": final_answer,
            "confidence": confidence,
            "reasoning": reasoning,
            "internal_thought": internal_thought,
            "new_messages": serialized_messages,
            "pending_actions": current_pending,
            "active_skills": active_skills
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
