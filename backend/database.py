import os
from datetime import datetime
from uuid import UUID
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class DatabaseService:
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL", "")
        key: str = os.getenv("SUPABASE_KEY", "")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        self.client: Client = create_client(url, key)

    # Conversation Management
    async def create_conversation(self, title: str = "New Conversation") -> Dict[str, Any]:
        result = self.client.table("conversations").insert({"title": title}).execute()
        return result.data[0]

    async def get_conversations(self, limit: int = 20) -> List[Dict[str, Any]]:
        result = self.client.table("conversations")\
            .select("*")\
            .order("updated_at", desc=True)\
            .limit(limit)\
            .execute()
        return result.data

    # Message Management
    async def add_message(self, conversation_id: str, role: str, content: str, tool_calls: List[Dict] = None):
        data = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "tool_calls": tool_calls or []
        }
        result = self.client.table("messages").insert(data).execute()
        return result.data[0]

    async def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        result = self.client.table("messages")\
            .select("*")\
            .eq("conversation_id", conversation_id)\
            .order("created_at")\
            .execute()
        return result.data

    # Knowledge Base / RAG
    async def add_memory(self, content: str, embedding: List[float], metadata: Dict = None):
        data = {
            "content": content,
            "embedding": embedding,
            "metadata": metadata or {}
        }
        result = self.client.table("memories").insert(data).execute()
        return result.data

    async def search_memories(self, query_embedding: List[float], match_threshold: float = 0.5, match_count: int = 5):
        # This requires an RPC function 'match_memories' to be defined in Supabase
        result = self.client.rpc("match_memories", {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count,
        }).execute()
        return result.data

# Singleton instance
db_service = DatabaseService()
