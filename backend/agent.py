
import os
import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.gemini import GeminiModel
from database import DatabaseService
from memory import memory_manager

load_dotenv()

# Initialize Services
db_service = DatabaseService()

# Gemini Configuration
GEMINI_MODEL_NAME = "gemini-3-flash-preview" # Or flash-preview if available
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing in .env")

# pydantic-ai automatically reads GEMINI_API_KEY or GOOGLE_API_KEY from env
model = GeminiModel(GEMINI_MODEL_NAME)

# Define Agent with Memory Capabilities
system_prompt = (
    "You are Aether, an advanced personal intelligence agent designed for proactivity and memory retention. "
    "Your primary directives are:\n"
    "1. **Knowledge Management**: You have a long-term vector memory. Use the `remember` tool to store important facts, user preferences, and project details. Use `recall` to retrieve context before answering complex questions.\n"
    "2. **Proactivity**: Anticipate user needs based on stored context.\n"
    "3. **Precision**: Provide concise, actionable answers.\n"
    "4. **Privacy**: Respect that data is stored locally.\n\n"
    "When the user shares a fact (e.g., 'I like dark mode', 'My project deadline is Friday'), call `remember` immediately.\n"
    "When the user asks a question that might rely on past conversations (e.g., 'What was the deadline?'), call `recall` first."
)

aether_agent = Agent(
    model=model,
    system_prompt=system_prompt,
    retries=3,
    deps_type=dict # We can inject dependencies here if needed
)

# --- TOOLS ---

@aether_agent.tool
async def get_current_time(ctx: RunContext[dict]) -> str:
    """Returns the current local time in ISO format."""
    from datetime import datetime
    return datetime.now().isoformat()

@aether_agent.tool
async def remember(ctx: RunContext[dict], content: str, category: str = "general") -> str:
    """
    Stores a piece of information in your long-term memory.
    Use this when the user tells you something important that you should remember for the future.
    Args:
        content: The fact or information to store.
        category: Optional category (e.g., 'preference', 'project', 'task').
    """
    try:
        # Use MemoryManager to handle embedding generation + storage
        result = await memory_manager.add_memory(
            db_service=db_service,
            content=content,
            metadata={"category": category}
        )
        
        if result and result.get("status") == "success":
            return f"Memory stored successfully: '{content}' (ID: {result['id']})"
        return "Failed to store memory in database."
    except Exception as e:
        return f"Error storing memory: {str(e)}"

@aether_agent.tool
async def recall(ctx: RunContext[dict], query: str) -> str:
    """
    Retrieves relevant information from your long-term memory.
    Use this when you need context to answer a question or when the user references past information.
    Args:
        query: A semantic search query to find relevant memories (e.g., 'project deadline', 'user preferences').
    """
    try:
        # Use MemoryManager to handle query embedding + search
        results = await memory_manager.search_relevant_memories(
            db_service=db_service,
            query=query,
            limit=3,
            similarity_threshold=0.6
        )
        
        if not results:
            return "No relevant memories found."
            
        # Format results for the LLM
        memory_str = "\n".join([f"- {r['content']} (Relevance: {r['similarity']:.2f})" for r in results])
        return f"Found relevant memories:\n{memory_str}"
        
    except Exception as e:
        return f"Error recalling memory: {str(e)}"


# Wrapper for API usage
async def get_agent_response(prompt: str):
    """
    Entry point for the backend API.
    Runs the agent with the given prompt.
    """
    # In a real app, we might inject user_id into deps here
    result = await aether_agent.run(prompt)
    return result.data
