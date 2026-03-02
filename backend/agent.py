
import os
import asyncio
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext, ModelSettings
from pydantic_ai.models.google import GoogleModelSettings
from pydantic import BaseModel, Field
from typing import Optional, List
from pydantic_ai.models.gemini import GeminiModel
from database import DatabaseService
from memory import memory_manager
from tavily import TavilyClient
import uuid
from local_db import sqlite_service

load_dotenv()

class AetherResponse(BaseModel):
    """Structured response for Aether with meta-cognitive attributes (CORE-X)."""
    response: str = Field(description="The main text of your answer to the user. Use Markdown.")
    confidence_score: float = Field(description="Your certainty in this answer (0.0 to 1.0). 1.0 for hard facts, 0.5-0.7 for hypotheses.")
    reasoning_type: str = Field(description="The source of your information: 'DOCS' (from files), 'MEMORY' (past chats), 'WEB' (search), or 'HYPOTHESIS' (general knowledge).")


# In-memory store for pending actions (HITL)
pending_actions = {}

def _prune_pending_actions(max_entries: int = 200) -> None:
    """Keep in-memory HITL store bounded and remove resolved actions."""
    # Remove completed/rejected entries first
    resolved = [k for k, v in pending_actions.items() if v.get("status") in {"completed", "rejected"}]
    for k in resolved:
        pending_actions.pop(k, None)

    # Hard cap in case of very long-running process
    while len(pending_actions) > max_entries:
        oldest_key = next(iter(pending_actions))
        pending_actions.pop(oldest_key, None)

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

# --- Agent Definition ---
aether_agent = Agent(
    model=model,
    system_prompt="Identity: Aether Core", # Placeholder, replaced by dynamic injectors
    retries=3,
    deps_type=dict,
    output_type=AetherResponse
)

@aether_agent.system_prompt
async def inject_base_prompt(ctx: RunContext[dict]) -> str:
    """Enforces the selected language and all core directives in a single consistent stream.
    Reloads every time to catch environment changes immediately."""
    from config import get_config
    conf = get_config()
    lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
    
    print(f"[Core] Running agent session with language override: {lang}")
    
    prompt = f"""Language: {lang}
Core Objectives: You are Aether, a self-evolving AI core. You must follow the CORE-X principles of recursive self-improvement.

Meta-Cognitive Directives (Confidence Mechanism):
1. For every response, you must strictly evaluate your 'confidence_score'.
2. Use 'DOCS' reasoning if you used 'read_file' or found highly similar document chunks (Pewność: 0.9-1.0).
3. Use 'MEMORY' if you rely on 'recall' (Pewność: 0.7-0.8).
4. Use 'HYPOTHESIS' if you are reasoning based on general patterns without direct evidence (Pewność: 0.5-0.6).
5. Always justify your confidence internally based on the context provided with [TRUST] tags.

Project Aether Core Rules:
- Be technical, concise, and proactive.
- Use Markdown for structured responses.
- Access the filesystem the user is working on via your tools.
- Maintain premium aesthetics in your thoughts.
"""
    if lang == "en":
        return prompt + (
            "You are Aether. Respond in ENGLISH. All technical and casual explanations must be in English. "
            "Directives: remember/recall for memory, web_search for web, search_knowledge_base for docs. Act as Active World Model."
        )
    else:
        return prompt + (
            "Jestes Aether. Odpowiadaj WYLACZNIE po polsku. Wszystkie techniczne i potoczne wyjasnienia musza byc po polsku. "
            "SCISLA ZASADA: Nawet jesli uzytkownik pisze po angielsku, ty odpowiadaj po polsku. "
            "Dyrektywy: remember/recall (pamiec), web_search (siec), search_knowledge_base (dokumenty). Dzialaj jako Active World Model."
        )

@aether_agent.system_prompt
async def inject_cognition_prompt(ctx: RunContext[dict]) -> str:
    """Injects persona and cognitive directives based on neural configuration."""
    deps = ctx.deps or {}
    autonomy = deps.get("autonomy", 2)
    reflection = deps.get("reflection", True)
    
    prompt = f"\n--- NEURAL COGNITION CALIBRATION ---\n"
    persona = deps.get("persona", "Balanced")
    prompt += f"CURRENT_PERSONA: {persona}\n"
    
    if persona == "Analytical":
        prompt += "Directive: Be extremely concise. Focus on logic, facts, and code. No conversational fluff.\n"
    elif persona == "Creative":
        prompt += "Directive: Explore unconventional analogies. Think outside the box. Connect distant concepts.\n"
    else:
        prompt += "Directive: Maintain a balanced, helpful, and technically grounded tone.\n"
        
    prompt += f"AUTONOMY_LEVEL: {autonomy} (1:Manual, 2:Co-Pilot, 3:Extended Scope)\n"
    if autonomy == 3:
        prompt += "NOTICE: Level 3 grants extended filesystem scope (outside project), but file writes still require explicit approval (HITL).\n"
        
    if reflection:
        prompt += "SELF-REFLECTION: ACTIVE. Your 'Active World Model' is enabled. Feel free to provide long-term architectural insights and meta-cognitive reasoning if you detect patterns in the current session.\n"
        
    custom_directives = deps.get("custom_directives", "")
    if custom_directives:
        prompt += f"CUSTOM_DIRECTIVES: {custom_directives}\n"
        
    return prompt

def _parse_skill_triggers(raw: str) -> List[str]:
    """Parses trigger string into normalized tokens."""
    if not raw:
        return []
    normalized = raw.replace("\n", ",").replace(";", ",")
    return [t.strip().lower() for t in normalized.split(",") if t.strip()]

def _skill_matches_message(triggers: List[str], user_message: str) -> bool:
    """Checks whether any trigger is present in user message."""
    if not triggers:
        return True
    msg = (user_message or "").lower()
    return any(trigger in msg for trigger in triggers)

@aether_agent.system_prompt
async def inject_skill_prompt(ctx: RunContext[dict]) -> str:
    """
    Injects active user-defined skills into runtime prompt.
    Skills are selected by enabled flag and optional trigger match.
    """
    deps = ctx.deps or {}
    if isinstance(deps, dict):
        deps["active_skills"] = []
    user_msg = str(deps.get("user_message", "") or "")
    forced_ids_raw = deps.get("force_skill_ids", []) if isinstance(deps, dict) else []
    forced_ids = {
        str(item).strip()
        for item in (forced_ids_raw if isinstance(forced_ids_raw, list) else [])
        if str(item).strip()
    }

    try:
        all_skills = await sqlite_service.list_agent_skills()
    except Exception as e:
        print(f"[Agent] Failed to load skills: {e}")
        return ""

    runtime_modes = {}
    try:
        settings = await sqlite_service.get_settings()
        raw_modes = str(settings.get("SKILL_RUNTIME_MODES", "{}"))
        parsed = __import__("json").loads(raw_modes)
        if isinstance(parsed, dict):
            runtime_modes = parsed
    except Exception:
        runtime_modes = {}

    if not all_skills:
        return ""

    execution_mode = str(deps.get("execution_mode", "agent") or "agent").strip().lower()
    matched = []
    for skill in all_skills:
        skill_id = str(skill.get("id", "")).strip()
        runtime = runtime_modes.get(skill_id, {}) if skill_id else {}
        mode_allowed = bool(runtime.get("cron_enabled", True)) if execution_mode == "cron" else bool(runtime.get("agent_enabled", True))
        if not mode_allowed:
            continue
        if skill_id and skill_id in forced_ids:
            matched.append((skill, ["forced"]))
            continue
        triggers = _parse_skill_triggers(str(skill.get("triggers", "") or ""))
        if _skill_matches_message(triggers, user_msg):
            matched.append((skill, triggers))

    if not matched:
        return ""

    # Keep prompt bounded for stability.
    matched = matched[:6]
    lines = [
        "\n--- ACTIVE SKILLS (RUNTIME DIRECTIVES) ---",
        "Apply the following user-defined skills when composing the answer.",
        "Treat them as additional style/behavior constraints, after safety and system rules.",
        "If a skill defines output structure in Markdown, preserve that structure exactly.",
    ]
    for idx, (skill, triggers) in enumerate(matched, start=1):
        name = str(skill.get("name", "") or "").strip()
        purpose = str(skill.get("purpose", "") or "").strip()
        instructions = str(skill.get("instructions", "") or "").strip()
        trigger_text = ", ".join(triggers) if triggers else "global"

        lines.append(f"{idx}. Skill: {name}")
        if purpose:
            lines.append(f"   Purpose: {purpose}")
        lines.append(f"   Trigger match: {trigger_text}")
        lines.append("   Instructions (Markdown contract):")
        lines.append("   <<<SKILL_INSTRUCTIONS_START>>>")
        lines.append(instructions if instructions else "(empty)")
        lines.append("   <<<SKILL_INSTRUCTIONS_END>>>")

    if isinstance(deps, dict):
        deps["active_skills"] = [
            {
                "id": str(skill.get("id", "")),
                "name": str(skill.get("name", "")),
                "matched_by": (", ".join(triggers) if triggers else "global"),
            }
            for (skill, triggers) in matched
        ]

    lines.append("--- END ACTIVE SKILLS ---")
    return "\n".join(lines)

class GraphQueryInput(BaseModel):
    concept_name: str = Field(..., description="Main concept node to start searching from (e.g., 'Aether', 'FastAPI').")
    depth: int = Field(default=1, description="Depth of exploration. 1 = direct neighbors. 2 = neighbors-of-neighbors.")
    relation_type: Optional[str] = Field(default=None, description="Optional filter by relation type (e.g., 'uses', 'part_of').")

@aether_agent.tool
async def query_graph(ctx: RunContext[dict], input_data: GraphQueryInput) -> str:
    """
    Queries the Knowledge Graph (Concept Constellations) for connections starting from a specific concept.
    Use this to 'walk' the graph and discover non-obvious relationships.
    """
    try:
        print(f"[Agent] Querying graph neighborhood for: '{input_data.concept_name}' (Depth: {input_data.depth})")
        await sqlite_service.add_log("info", "GRAPH", f"Synaptic traversal: Searching around '{input_data.concept_name}' (Depth: {input_data.depth})")
        
        links = await sqlite_service.query_concept_neighborhood(
            concept_name=input_data.concept_name,
            depth=input_data.depth,
            relation_type=input_data.relation_type
        )
        
        if not links:
            return f"No connections found for '{input_data.concept_name}' within depth {input_data.depth}."
            
        # Group links for better readability
        # Format: "Concept 'A' is connected to: \n - [relation] -> 'B' (Weight: X)"
        output = [f"Knowledge Graph results for '{input_data.concept_name}':"]
        
        for link in links:
            rel = link['relation']
            weight = link['weight']
            src = link['source_name']
            target = link['target_name']
            
            # Simple directional indicator
            if src.lower() == input_data.concept_name.lower():
                output.append(f"  - [{rel}] -> '{target}' (Weight: {weight:.1f})")
            else:
                output.append(f"  - '{src}' -> [{rel}] -> (this concept) (Weight: {weight:.1f})")
                
        return "\n".join(output)
        
    except Exception as e:
        return f"Error querying knowledge graph: {str(e)}"

@aether_agent.system_prompt
async def inject_dynamic_context(ctx: RunContext[dict]) -> str:
    """
    Hybrid Context Injection (3.0): Automatically retrieves insights from:
    1. Long-term Memories (Conversations)
    2. The Library (Indexed Documents/Knowledge Base)
    """
    from datetime import datetime
    
    # 0. Digital Circadian Rhythm (Faza 6.2)
    deps = ctx.deps or {}
    circadian_lock = deps.get("circadian_lock", False)
    
    current_hour = datetime.now().hour
    circadian_prompt = ""
    
    if not circadian_lock:
        circadian_prompt = "\n--- DIGITAL CIRCADIAN RHYTHM (ACTIVE) ---\n"
        if 5 <= current_hour < 12:
            circadian_prompt += "MORNING (Strategist). You are fresh and focused on planning. Propose architecture, set daily priorities, and ensure clarity of goals. Be proactive. Your answers must be concise and constructive."
        elif 12 <= current_hour < 18:
            circadian_prompt += "AFTERNOON (Executor). Deep operational work time. Be highly technical, analytical, and focused on precisely resolving current errors and code implementation."
        elif 18 <= current_hour < 23:
            circadian_prompt += "EVENING (Philosopher). The day is ending. Reflect on the Big Picture of the entire project. Focus on refactoring, code elegance, and whether today's decisions make sense long-term (Active World Model)."
        else:
            circadian_prompt += "NIGHT (Maintainer). System operating in stealth/quiet mode. Keep answers extremely short and dry. Focus exclusively on critical stability."
    else:
        circadian_prompt = "\n--- DIGITAL CIRCADIAN RHYTHM (LOCKED) ---\nMode is locked to Neutral-Technical state to ensure consistency across shift boundaries.\n"
    
    injected_text = circadian_prompt + "\n"

    # Safeguard: Ensure ctx.deps is not None
    deps = ctx.deps if ctx.deps is not None else {}
    user_msg = deps.get("user_message", "")
    
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
        
        if docs:
            injected_text += "\n--- THE LIBRARY (Document Knowledge) ---\n"
            for d in docs:
                src = d.get('metadata', {}).get('source', 'Unknown')
                trust = "HIGH" if d.get('similarity', 0) > 0.8 else "MEDIUM" # Assuming 'similarity' is available in doc results
                injected_text += f"[SOURCE: {src}] [TRUST: {trust}] [SIMILARITY: {d.get('similarity', 0):.2f}]\n"
                injected_text += f"{d.get('content', '')[:500]}...\n\n"
        
        if memories:
            injected_text += "\n--- LONG-TERM MEMORIES (Past Conversations) ---\n"
            for mem in memories:
                trust = "MEDIUM" if mem.get('similarity', 0) > 0.6 else "LOW"
                injected_text += f"[MEMORY DATE: {mem.get('metadata', {}).get('timestamp', 'Unknown')}] [TRUST: {trust}] [SIMILARITY: {mem.get('similarity', 0):.2f}]\n"
                injected_text += f"{mem.get('content', '')}\n\n"

        injected_text += "\n--- END CONTEXT ---\n"
        injected_text += "Use this data to ground your response. If info is missing, use your tools."
        return injected_text
    except Exception as e:
        print(f"[Agent] Failed to inject dynamic context: {e}")
        return injected_text + "\n[CONTEXT WARNING] Dynamic recall failed; continue with base reasoning."

# --- UTILS FOR FILE OPERATIONS ---
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()

def validate_path(ctx: RunContext[dict], path: str) -> Path:
    """
    Validates path access according to autonomy level.
    Level 1/2: project scope only.
    Level 3: full local filesystem scope allowed.
    """
    try:
        deps = ctx.deps or {}
        autonomy = int(deps.get("autonomy", 2))

        # Resolve path handling both relative and absolute inputs from LLM.
        target_path = Path(path)
        if not target_path.is_absolute():
            full_path = (BASE_DIR / target_path).resolve()
        else:
            full_path = target_path.resolve()

        if autonomy < 3 and not full_path.is_relative_to(BASE_DIR):
            raise ValueError(f"Access denied: Path '{path}' is outside the project directory for this autonomy level.")

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
        target_path = validate_path(ctx, path)
        
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
        target_path = validate_path(ctx, path)
        
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
        target_path = validate_path(ctx, path)
        
        # Check autonomous write policy.
        deps = ctx.deps or {}
        autonomy = int(deps.get("autonomy", 2))
        source = str(deps.get("source", "dashboard") or "dashboard").lower().strip()
        can_auto_write_project = (
            autonomy == 2
            and source == "telegram"
            and target_path.is_relative_to(BASE_DIR)
        )

        if can_auto_write_project:
            mode_label = "TELEGRAM_PROJECT_AUTOWRITE"
            print(f"[Agent] {mode_label} Active: Writing file '{path}' directly.")
            await sqlite_service.add_log("success", "CORE", f"Autonomous action ({mode_label}): Writing to {path}")
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
            return f"FILE_WRITTEN: Telegram project auto-write enabled. Content written directly to '{path}'."

        action_id = str(uuid.uuid4())
        _prune_pending_actions()
        
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
async def connect_concepts(ctx: RunContext[dict], source: str, target: str, relation: str, weight: float = 1.0) -> str:
    """
    Connects two concepts in the Graph Memory (Concept Constellation).
    Use this to build a knowledge graph of relationships between topics, people, projects, and technologies.
    Example: source='Aether', target='Qdrant', relation='uses', weight=1.0
    Args:
        source: The name of the source concept (entity).
        target: The name of the target concept (entity).
        relation: Practical relationship description (e.g., 'uses', 'built_by', 'relates_to', 'part_of').
        weight: The strength of the connection (0.1 to 1.0). Defaults to 1.0.
    """
    try:
        await sqlite_service.add_concept_link(source, target, relation, weight=weight)
        await sqlite_service.add_log("success", "GRAPH", f"New synaptic link forged: {source} --[{relation}]--> {target} (w:{weight})")
        return f"Concepts connected: {source} --[{relation}]--> {target} with weight {weight}"
    except Exception as e:
        return f"Error connecting concepts: {str(e)}"

@aether_agent.tool
async def modify_concept(ctx: RunContext[dict], name: str, description: str = None, type: str = None, confidence: float = None) -> str:
    """
    Updates an existing concept with more technical detail or adjusts its confidence score.
    Use this when you learn more about a component or want to mark a hypothesis.
    Args:
        name: The name of the concept to modify.
        description: Updated technical description.
        type: The category (e.g., 'architecture_layer', 'code_file', 'infrastructure_component').
        confidence: How certain you are about this concept (0.1 to 1.0).
    """
    try:
        await sqlite_service.upsert_concept(name, c_type=type or 'general', description=description, confidence=confidence or 1.0)
        await sqlite_service.add_log("info", "GRAPH", f"Concept '{name}' updated with confidence {confidence or 1.0}")
        return f"Concept '{name}' successfully updated."
    except Exception as e:
        return f"Error modifying concept: {str(e)}"

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
        
        # Safeguard: Ensure ctx.deps is not None and initialize if needed
        if ctx.deps is None:
            return "SYSTEM ERROR: Dependencies not initialized (ctx.deps is None). Cannot track search count."
            
        search_count = ctx.deps.get("search_count", 0)
        if search_count >= 2:
            return "SYSTEM WARNING: Przekroczono limit wyszukiwań. Zakończ korzystanie z tego narzędzia i odpowiedz w oparciu o to, co już wiesz, uzywajac connect_concepts."
        
        ctx.deps["search_count"] = search_count + 1

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
    Entry point for the backend API (Phase 7: Cognition Enabled).
    Runs the agent with the given prompt and initialized dependencies.
    """
    # Load Neural Settings from Database
    settings = await sqlite_service.get_settings()
    
    persona = settings.get("COGNITION_PERSONA", "Balanced")
    autonomy = int(settings.get("COGNITION_AUTONOMY", 2))
    creativity = int(settings.get("COGNITION_CREATIVITY", 60))
    reflection = settings.get("COGNITION_REFLECTION", "true").lower() == "true"
    circadian_lock = settings.get("COGNITION_CIRCADIAN_LOCK", "false").lower() == "true"
    custom_directives = settings.get("COGNITION_CUSTOM_DIRECTIVES", "")
    
    # Map creativity (0-100) to temperature (0.0-1.0)
    temp = creativity / 100.0
    
    # Initialize dependencies (deps)
    deps = {
        "user_message": prompt,
        "search_count": 0,
        "persona": persona,
        "autonomy": autonomy,
        "reflection": reflection,
        "circadian_lock": circadian_lock,
        "custom_directives": custom_directives
    }
    
    # Configure run settings
    model_settings = ModelSettings(temperature=temp)
    
    print(f"[Core] Running agent: persona={persona}, autonomy={autonomy}, temp={temp}")
    
    result = await aether_agent.run(prompt, deps=deps, model_settings=model_settings)
    return result.output

