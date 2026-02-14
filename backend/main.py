from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from agent import aether_agent

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
