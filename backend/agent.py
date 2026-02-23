
import os
import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.gemini import GeminiModel
from database import DatabaseService
from memory import memory_manager
from tavily import TavilyClient

load_dotenv()

# Initialize Services
db_service = DatabaseService()

# Gemini Configuration
GEMINI_MODEL_NAME = "gemini-3-flash-preview" # Or flash-preview if available
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing in .env")

# Tavily Configuration
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
tavily_client = None
if TAVILY_API_KEY:
    tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
else:
    print("WARNING: TAVILY_API_KEY missing in .env. Web search will be disabled.")

# pydantic-ai automatically reads GEMINI_API_KEY or GOOGLE_API_KEY from env
model = GeminiModel(GEMINI_MODEL_NAME)

# Define Agent with Memory Capabilities
system_prompt = (
    "You are Aether, an advanced personal intelligence agent designed for proactivity and memory retention. "
    "Your primary directives are:\n"
    "1. **Knowledge Management**: You have a long-term vector memory. Use the `remember` tool to store important facts, user preferences, and project details. Use `recall` to retrieve context before answering complex questions.\n"
    "2. **Web Research**: You have access to the internet via Tavily. Use the `web_search` tool ONLY when:\n"
    "   - The user asks about current events (news, weather, stock prices).\n"
    "   - You lack specific technical knowledge in your internal training or memory.\n"
    "   - The user explicitly asks you to 'search' or 'find online'.\n"
    "   - DO NOT search for personal information stored in your memory (use `recall` instead).\n"
    "3. **Document Analysis**: You have access to a library of project documents via `search_knowledge_base`. Use this when asked about specific project details, specifications, or uploaded files.\n"
    "5. **System Operations**: You can explore the project structure using `list_directory` and read file contents using `read_file`. Use this to understand the codebase or retrieve specific configurations for your Internal Simulation.\n"
    "6. **Cognitive Autonomy**: Act as an Active World Model. Don't just answer; reflect on the impact of your answers on the user's overall project philosophy.\n"
    "7. **Proactivity**: Anticipate user needs based on stored context and past decisions.\n"
    "8. **Precision**: Provide concise, actionable answers.\n\n"
    "When the user shares a fact, call `remember` immediately.\n"
    "When the user asks about project specs, call `search_knowledge_base`.\n"
    "When asked to analyze the codebase or a specific file, use `list_directory` and `read_file`."
)

aether_agent = Agent(
    model=model,
    system_prompt=system_prompt,
    retries=3,
    deps_type=dict 
)

# --- UTILS FOR FILE OPERATIONS ---
from pathlib import Path

BASE_DIR = Path(".").resolve()

def validate_path(path: str) -> Path:
    """Validates that the path is within the allowed project directory for security."""
    try:
        # Resolve path handling both relative and absolute inputs from LLM
        target_path = Path(path)
        if not target_path.is_absolute():
            full_path = (BASE_DIR / target_path).resolve()
        else:
            full_path = target_path.resolve()
            
        if not full_path.is_relative_to(BASE_DIR):
            raise ValueError(f"Access denied: Path '{path}' is outside the project directory.")
            
        return full_path
    except Exception as e:
        raise ValueError(f"Invalid path: {str(e)}")

# --- TOOLS ---

@aether_agent.tool
async def list_directory(ctx: RunContext[dict], path: str = ".") -> str:
    """
    Lists files and directories in the specified path.
    Use this to explore the project structure.
    Args:
        path: The directory path to list (relative to project root). Defaults to current directory.
    """
    try:
        print(f"[Agent] Listing directory: '{path}'")
        target_path = validate_path(path)
        
        if not target_path.exists():
            return f"Error: Directory '{path}' does not exist."
        if not target_path.is_dir():
            return f"Error: '{path}' is not a directory."
            
        items = []
        for item in target_path.iterdir():
            # Filter out heavy or sensitive folders
            if item.name.startswith(".") and item.name != ".env":
                continue
            if item.name in ["__pycache__", "node_modules", ".venv", "aether_memory", "qdrant_storage"]:
                continue
                
            type_str = "<DIR>" if item.is_dir() else "<FILE>"
            items.append(f"{type_str:<6} {item.name}")
            
        return f"Contents of '{path}':\n" + "\n".join(items)
        
    except ValueError as e:
        return str(e)
    except Exception as e:
        return f"Error listing directory: {str(e)}"

@aether_agent.tool
async def read_file(ctx: RunContext[dict], path: str) -> str:
    """
    Reads the content of a file.
    Use this to inspect code, configuration, or documentation files.
    Args:
        path: The file path to read (relative to project root).
    """
    try:
        print(f"[Agent] Reading file: '{path}'")
        target_path = validate_path(path)
        
        if not target_path.exists():
            return f"Error: File '{path}' does not exist."
        if not target_path.is_file():
            return f"Error: '{path}' is not a file."
            
        # 100KB limit to prevent context overflow or system lag
        if target_path.stat().st_size > 100_000:
            return f"Error: File '{path}' is too large to read (Size: {target_path.stat().st_size} bytes)."
            
        with open(target_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        return f"--- Content of '{path}' ---\n{content}\n--- End of file ---"
        
    except ValueError as e:
        return str(e)
    except Exception as e:
        return f"Error reading file: {str(e)}"

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

@aether_agent.tool
async def web_search(ctx: RunContext[dict], query: str) -> str:
    """
    Performs a web search using Tavily to find up-to-date information.
    Use this for:
    - Current events and news
    - Technical documentation not in your training data
    - Fact-checking
    Args:
        query: The search query string.
    """
    if not tavily_client:
        return "Web search is disabled because TAVILY_API_KEY is missing."
    
    try:
        # Perform search (Tavily's search is synchronous, so run in thread if needed for high load, 
        # but for single agent calls it's usually fast enough. Let's wrap in thread to be safe async citizen)
        print(f"[Agent] Searching web for: '{query}'")
        response = await asyncio.to_thread(
            tavily_client.search,
            query=query,
            search_depth="basic",
            max_results=3
        )
        
        # Format results
        results = response.get("results", [])
        if not results:
            return "No web results found."
            
        formatted = "\n".join([
            f"- [{r['title']}]({r['url']}): {r['content'][:200]}..." 
            for r in results
        ])
        return f"Web Search Results for '{query}':\n{formatted}"
        
    except Exception as e:
        return f"Error performing web search: {str(e)}"

@aether_agent.tool
async def search_knowledge_base(ctx: RunContext[dict], query: str) -> str:
    """
    Searches the internal knowledge base (uploaded documents, specs, manuals) for relevant information.
    Use this when the user asks about the 'project', 'architecture', 'manifesto', or specific documented features.
    Args:
        query: The semantic search query.
    """
    try:
        print(f"[Agent] Searching knowledge base for: '{query}'")
        query_embedding = await memory_manager.get_embedding(query)
        if not query_embedding:
            return "Failed to generate query embedding."
            
        # Run DB search in thread
        docs = await asyncio.to_thread(
            db_service.search_documents,
            query_embedding=query_embedding,
            match_threshold=0.5,
            match_count=3
        )
        
        if not docs:
            return "No relevant documents found in knowledge base."
            
        formatted = "\n".join([f"- [Source: {d['metadata'].get('source')}] {d['content'][:300]}..." for d in docs])
        return f"Found relevant documents:\n{formatted}"
        
    except Exception as e:
        return f"Error searching knowledge base: {str(e)}"


# Wrapper for API usage
async def get_agent_response(prompt: str):
    """
    Entry point for the backend API.
    Runs the agent with the given prompt.
    """
    # In a real app, we might inject user_id into deps here
    result = await aether_agent.run(prompt)
    return result.data
