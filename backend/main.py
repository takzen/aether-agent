from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import aether_agent, db_service, pending_actions
import asyncio
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

@app.get("/ping")
async def ping():
    return {"status": "success", "message": "pong", "version": "0.1.0"}

@app.get("/stats")
async def get_stats():
    """Returns database statistics for the dashboard."""
    stats = db_service.get_stats()
    return {
        "status": "success",
        "stats": stats
    }

@app.post("/ingest")
async def ingest_file(file: UploadFile = File(...)):
    """
    Endpoint to ingest a file (PDF, TXT, MD) into the knowledge base.
    """
    try:
        content = await file.read()
        # Decode bytes to string assuming utf-8. 
        # For PDFs, we would need a PDF reader (pypdf), but let's assume text/md for now.
        if file.content_type == "application/pdf":
            return {"status": "error", "message": "PDF support coming soon. Please upload .txt or .md."}
            
        text_content = content.decode("utf-8")
        
        # Process asynchronously (could be detached task in background)
        success = await process_content(text_content, file.filename, db_service)
        
        if success:
            return {"status": "success", "message": f"File '{file.filename}' processed successfully."}
        else:
            return {"status": "error", "message": "Failed to process content."}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/knowledge/{filename}")
async def delete_document(filename: str):
    """
    Deletes a document from the knowledge base by filename.
    """
    try:
        if db_service.delete_document(filename):
            return {"status": "success", "message": f"Document '{filename}' deleted."}
        else:
            return {"status": "error", "message": "Failed to delete document."}
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
    Returns a list of all documents in the knowledge base.
    """
    try:
        docs = db_service.list_documents()
        return {"status": "success", "documents": docs}
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
        history = None
        if request.message_history:
            history = ModelMessagesTypeAdapter.validate_python(request.message_history)
            
        run_kwargs = {
            "user_prompt": request.message,
            "deps": {"user_message": request.message},
        }
        if history:
            run_kwargs["message_history"] = history

        if request.model == "ollama":
            from pydantic_ai.models.ollama import OllamaModel
            model_override = OllamaModel("llama3.2")
            run_kwargs["model"] = model_override
            
        result = await aether_agent.run(**run_kwargs)
        
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
            "internal_thought": result.output.internal_thought,
            "pendingActions": current_pending if current_pending else None
        }
        await sqlite_service.add_message(
            session_id=active_session_id,
            role="assistant",
            content=result.output.final_answer,
            metadata=ai_meta
        )

        return {
            "status": "success",
            "session_id": active_session_id,
            "response": result.output.final_answer,
            "internal_thought": result.output.internal_thought,
            "new_messages": serialized_messages,
            "pending_actions": current_pending
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
