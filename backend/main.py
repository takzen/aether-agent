from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import aether_agent, db_service
import asyncio
from ingest import process_content

app = FastAPI(title="Aether API", version="0.1.0")

class ChatRequest(BaseModel):
    message: str

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

from pydantic_ai.messages import ModelMessagesTypeAdapter

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        result = await aether_agent.run(request.message)
        
        # Official PydanticAI way to serialize messages to list of dicts
        serialized_messages = ModelMessagesTypeAdapter.dump_python(result.new_messages())

        return {
            "status": "success",
            "response": result.output,
            "new_messages": serialized_messages
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
