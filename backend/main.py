from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import aether_agent, db_service, pending_actions
import asyncio
import os
from ingest import process_content

app = FastAPI(title="Aether API", version="0.1.0")

from typing import Optional, List, Any

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini"
    session_id: Optional[str] = None
    message_history: Optional[List[dict]] = None

class ActionApproval(BaseModel):
    action_id: str
    approved: bool

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from local_db import sqlite_service

@app.on_event("startup")
async def startup():
    await sqlite_service.init_db()
    await sqlite_service.add_log("success", "CORE", "Aether Kernel initialized. Core services operational.")

@app.get("/ping")
async def ping():
    return {"status": "success", "message": "pong", "version": "0.1.0"}

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

@app.get("/config")
async def read_configuration():
    """Returns the current backend configuration."""
    try:
        conf = get_config()
        # For security, we might want to mask keys, but since this is a local tool, we send them to the UI so it can edit them.
        return {"status": "success", "config": conf}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/config")
async def update_configuration(new_conf: ConfigUpdate):
    """Updates the .env configuration and reloads environment."""
    print(f"[Config] Received update request: {new_conf}")
    try:
        success = write_config({
            "GEMINI_API_KEY": new_conf.GEMINI_API_KEY,
            "TAVILY_API_KEY": new_conf.TAVILY_API_KEY,
            "QDRANT_URL": new_conf.QDRANT_URL,
            "QDRANT_API_KEY": new_conf.QDRANT_API_KEY,
            "MODEL_OVERRIDE": new_conf.MODEL_OVERRIDE
        })
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
            
        # Decode for processing
        if file.filename.endswith(".pdf"):
            return {"status": "error", "message": "PDF support coming soon. Please upload .txt or .md."}
            
        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            return {"status": "error", "message": "Only UTF-8 encoded files are supported currently."}
        
        # Process asynchronously
        success = await process_content(text_content, file.filename, db_service)
        
        if success:
            await sqlite_service.add_log("success", "KNOWLEDGE", f"Indexed source: {file.filename}")
            return {"status": "success", "message": f"File '{file.filename}' processed and saved successfully."}
        else:
            return {"status": "error", "message": "Failed to index content into vector database."}
            
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
            
        with open(file_path, "r", encoding="utf-8") as f:
            text_content = f.read()
            
        success = await process_content(text_content, filename, db_service)
        
        if success:
            await sqlite_service.add_log("success", "KNOWLEDGE", f"Manually indexed existing source: {filename}")
            return {"status": "success", "message": f"File '{filename}' indexed successfully."}
        else:
            return {"status": "error", "message": "Failed to index content."}
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
    """Returns all messages of a specific session."""
    try:
        msgs = await sqlite_service.get_messages(session_id)
        return {"status": "success", "messages": msgs}
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
async def get_system_logs():
    """Returns the latest system execution logs."""
    try:
        logs = await sqlite_service.get_logs(limit=50)
        return {"status": "success", "logs": logs}
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
            with open(action["path"], "w", encoding="utf-8") as f:
                f.write(action["content"])
            action["status"] = "completed"
            return {"status": "success", "message": f"Successfully wrote to {action['display_path']}"}
        
        return {"status": "error", "message": "Unknown action type."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        from pydantic_ai.messages import ModelMessagesTypeAdapter
        from agent import create_model_instance, get_current_model_name, is_ollama_model
        
        history = None
        if request.message_history:
            history = ModelMessagesTypeAdapter.validate_python(request.message_history)
            
        run_kwargs = {
            "user_prompt": request.message,
            "deps": {"user_message": request.message},
        }
        if history:
            run_kwargs["message_history"] = history

        # Dynamic Model Loading
        # Priority: Request parameter > Environment Config
        selected_model_id = request.model if request.model and request.model != "gemini" else get_current_model_name()
        
        # Backward compatibility for 'ollama' toggle in generic chat UI
        if selected_model_id == "ollama":
            selected_model_id = "ollama:llama3.2"
        
        active_model = create_model_instance(selected_model_id)
        run_kwargs["model"] = active_model
            
        await sqlite_service.add_log("info", "LLM", f"Agent call initiated: model={selected_model_id}")
        result = await aether_agent.run(**run_kwargs)
        
        # Extract response — agent now returns plain str for universal compatibility
        raw_output = result.output  # This is a str
        
        # For local models we don't get structured thought/answer split,
        # so the entire output IS the final answer.
        final_answer = raw_output
        internal_thought = f"[Model: {selected_model_id}] Processed query."
        
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
        
        # Serialize messages to load into the frontend Context
        serialized_messages = ModelMessagesTypeAdapter.dump_python(result.new_messages())

        # Save AI Response
        ai_meta = {
            "internal_thought": internal_thought,
            "pendingActions": current_pending if current_pending else None
        }
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
            "internal_thought": internal_thought,
            "new_messages": serialized_messages,
            "pending_actions": current_pending
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
