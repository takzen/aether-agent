from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

# --- AI Input/Output Schemas (PydanticAI) ---

class AgentMessage(BaseModel):
    agent_id: Literal[
        'scout', 'bureaucrat', 'legalist', 'historian', 'modernist', 
        'auditor', 'shrink', 'analyst', 'ecologist', 'citizen'
    ]
    content: str
    message_type: Literal[
        'discovery', 'bureaucrat', 'legal', 'history', 'tech', 
        'audit', 'shrink', 'stats', 'eco', 'human'
    ]
    parent_index: Optional[int] = Field(None, description="Index of the message this message is replying to (0-indexed)")

class DebateResult(BaseModel):
    summary: str
    absurd_score: float
    messages: List[AgentMessage]
    tags: List[str]

# --- Database / App Models ---

class Message(BaseModel):
    id: Optional[str] = None
    debate_id: Optional[str] = None
    agent_id: str
    agent_name: str
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    type: str = "text" # e.g., "text", "discovery", "legal", "tech"
    parent_id: Optional[str] = None

class Debate(BaseModel):
    id: str
    title: str
    summary: Optional[str] = None
    absurd_score: float = 0.0
    status: str = "active" # "active", "completed", "archived"
    created_at: datetime = Field(default_factory=datetime.now)
    messages: List[Message] = []
    tags: List[str] = []

class AgentVote(BaseModel):
    agent_id: str
    debate_id: str
    score: float
    reason: str
