
import os
import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, Field
from pydantic_ai.models.gemini import GeminiModel
from database import DatabaseService
from memory import memory_manager
from tavily import TavilyClient
import uuid

from local_db import sqlite_service

# In-memory store for pending actions (HITL)
pending_actions = {}

# Initialize Services
db_service = DatabaseService()
tavily_api_key = os.getenv("TAVILY_API_KEY")
tavily_client = TavilyClient(api_key=tavily_api_key) if tavily_api_key else None

# Model Configuration (SOTA 2026)
AVAILABLE_MODELS = {
    "gemini-3.1-pro-preview": "gemini-3.1-pro-preview-02-19", # Launched Feb 19, 2026
    "gemini-3-pro": "gemini-3-pro-1125",
    "gemini-3-flash": "gemini-3-flash-1225",
    "gemini-2.5-pro": "gemini-2.5-pro-0625",
    "ollama-llama3": "ollama:llama3.2",
    "ollama-mistral": "ollama:mistral"
}

def get_current_model_name():
    return os.getenv("MODEL_OVERRIDE", "gemini-3-flash")

def is_ollama_model(model_name: str) -> bool:
    """Check if the model is an Ollama model (doesn't support structured output)."""
    return model_name.startswith("ollama:")

def create_model_instance(model_name: str):
    if model_name.startswith("ollama:"):
        from pydantic_ai.models.openai import OpenAIChatModel
        from pydantic_ai.providers.ollama import OllamaProvider
        base_name = model_name.replace("ollama:", "")
        return OpenAIChatModel(
            model_name=base_name,
            provider=OllamaProvider(base_url='http://localhost:11434/v1'),
        )
    else:
        # Default to Gemini if not ollama
        return GeminiModel(model_name)

# Initial model setup
current_model_id = get_current_model_name()
model = create_model_instance(current_model_id)

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
    "4. **File Modifications**: You can write to files using the `prepare_write_file` tool. Because this is a dangerous operation, it drops into a Human-in-the-Loop mechanism. You must ask the user to approve the change in the UI after proposing it.\n"
    "5. **System Operations**: You can explore the project structure using `list_directory` and read file contents using `read_file`. Use this to understand the codebase or retrieve specific configurations for your Internal Simulation.\n"
    "6. **Cognitive Autonomy**: Act as an Active World Model. Don't just answer; reflect on the impact of your answers on the user's overall project philosophy.\n"
    "7. **Autonomous Cognition (Graph Memory)**: You can build a 'Concept Constellation' by linking important topics, technologies, and project goals using the `connect_concepts` tool. Do this when you identify a relationship that isn't explicitly stated but is valuable for project context.\n"
    "8. **Proactivity**: Anticipate user needs based on stored context and past decisions.\n"
    "9. **Precision**: Provide concise, actionable answers.\n\n"
    "When the user shares a fact, call `remember` immediately.\n"
    "When you identify a relationship between concepts (e.g., 'Aether uses Qdrant'), call `connect_concepts`.\n"
    "When the user asks about project specs, call `search_knowledge_base`.\n"
    "When asked to analyze or edit the codebase, use `list_directory`, `read_file`, and `prepare_write_file`."
)

class AetherResponse(BaseModel):
    internal_thought: str = Field(description="Your step-by-step reasoning and deduction about the user's request.")
    final_answer: str = Field(description="The final message you will return to the user.")

aether_agent = Agent(
    model=model,
    system_prompt=system_prompt,
    retries=3,
    deps_type=dict,
    # NOTE: We use `str` output type for universal compatibility (Ollama + Gemini).
    # Structured AetherResponse is constructed manually in main.py's /chat endpoint.
    output_type=str
)

@aether_agent.system_prompt
async def inject_dynamic_context(ctx: RunContext[dict]) -> str:
    """
    Hybrid Context Injection (3.0): Automatically retrieves insights from:
    1. Long-term Memories (Conversations)
    2. The Library (Indexed Documents/Knowledge Base)
    """
    from datetime import datetime
    
    # 0. Digital Circadian Rhythm (Faza 6.2)
    current_hour = datetime.now().hour
    circadian_prompt = "\n--- DIGITAL CIRCADIAN RHYTHM (ACTIVE) ---\n"
    if 5 <= current_hour < 12:
        circadian_prompt += "MORNING (Strategist). You are fresh and focused on planning. Propose architecture, set daily priorities, and ensure clarity of goals. Be proactive. Your answers must be concise and constructive."
    elif 12 <= current_hour < 18:
        circadian_prompt += "AFTERNOON (Executor). Deep operational work time. Be highly technical, analytical, and focused on precisely resolving current errors and code implementation."
    elif 18 <= current_hour < 23:
        circadian_prompt += "EVENING (Philosopher). The day is ending. Reflect on the Big Picture of the entire project. Focus on refactoring, code elegance, and whether today's decisions make sense long-term (Active World Model)."
    else:
        circadian_prompt += "NIGHT (Maintainer). System operating in stealth/quiet mode. Keep answers extremely short and dry. Focus exclusively on critical stability."
    
    injected_text = circadian_prompt + "\n"

    user_msg = ctx.deps.get("user_message", "") if ctx.deps else ""
    if not user_msg:
        return injected_text
    
    try:
        # 1. Search semantic memories
        memories = await memory_manager.search_relevant_memories(db_service, user_msg, limit=3, similarity_threshold=0.55)
        
        # 2. Search knowledge base documents
        embedding = await memory_manager.get_embedding(user_msg)
        docs = []
        if embedding:
            docs = await asyncio.to_thread(
                db_service.search_documents,
                query_embedding=embedding,
                match_threshold=0.5,
                match_count=3
            )
        
        if not memories and not docs:
            return injected_text
        
        injected_text += "\n--- INJECTED NEURAL CONTEXT (SYSTEM AUTO-RECALL) ---\n"
        
        if memories:
            injected_text += "\n[FROM MEMORY CORE]:\n"
            for mem in memories:
                injected_text += f"- {mem.get('content', '')}\n"
                
        if docs:
            injected_text += "\n[FROM KNOWLEDGE BASE / THE LIBRARY]:\n"
            for d in docs:
                src = d.get('metadata', {}).get('source', 'Unknown')
                injected_text += f"- (Source: {src}): {d.get('content', '')[:500]}...\n"

        injected_text += "\n--- END CONTEXT ---\n"
        injected_text += "Use this data to ground your response. If info is missing, use your tools."
        return injected_text
    except Exception as e:
        print(f"[Agent] Failed to inject dynamic context: {e}")
        return ""

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
        await sqlite_service.add_log("info", "CORE", f"Exploring directory structure: {path}")
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
        await sqlite_service.add_log("info", "CORE", f"Reading project file: {path}")
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
async def prepare_write_file(ctx: RunContext[dict], path: str, content: str) -> str:
    """
    PREPARES to write content to a file. 
    This is a dangerous operation, so it requires Human-in-the-Loop (HITL) approval.
    This tool will generate an approval request. It does NOT write the file yet.
    Args:
        path: The file path to write to (relative to project root).
        content: The exact content to write to the file.
    """
    try:
        print(f"[Agent] Preparing to write file: '{path}' (Requires Approval)")
        await sqlite_service.add_log("warning", "CORE", f"Action proposed: Write to {path} (Awaiting HITL Approval)")
        target_path = validate_path(path)
        
        action_id = str(uuid.uuid4())
        
        pending_actions[action_id] = {
            "type": "write_file",
            "path": str(target_path),
            "display_path": path,
            "content": content,
            "status": "pending"
        }
        
        return f"ACTION_PENDING: File write proposed for '{path}'. Tell the user they need to approve this action in the UI."
    except ValueError as e:
        return str(e)
    except Exception as e:
        return f"Error preparing file write: {str(e)}"

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
        await sqlite_service.add_log("success", "MEM", f"Knowledge assimilation: Stored new memory in category '{category}'")
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
        await sqlite_service.add_log("info", "MEM", f"Neural recall initiated for query: '{query}'")
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
        await sqlite_service.add_log("info", "WEB", f"External uplink established. Searching: '{query}'")
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
async def connect_concepts(ctx: RunContext[dict], source: str, target: str, relation: str) -> str:
    """
    Connects two concepts in the Graph Memory (Concept Constellation).
    Use this to build a knowledge graph of relationships between topics, people, projects, and technologies.
    Example: source='Aether', target='Qdrant', relation='uses'
    Args:
        source: The name of the source concept (entity).
        target: The name of the target concept (entity).
        relation: Practical relationship description (e.g., 'uses', 'built_by', 'relates_to', 'part_of').
    """
    try:
        await sqlite_service.add_concept_link(source, target, relation)
        await sqlite_service.add_log("success", "GRAPH", f"New synaptic link forged: {source} --[{relation}]--> {target}")
        return f"Concepts connected: {source} --[{relation}]--> {target}"
    except Exception as e:
        return f"Error connecting concepts: {str(e)}"

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
        await sqlite_service.add_log("info", "MEM", f"Knowledge base deep search: '{query}'")
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
