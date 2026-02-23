import asyncio
import aiosqlite
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

class SQLiteService:
    def __init__(self, db_path: str = "aether.db", schema_path: str = "schema.sql"):
        self.db_path = db_path
        self.schema_path = schema_path

    async def init_db(self):
        """Initializes the SQLite database with the schema."""
        async with aiosqlite.connect(self.db_path) as db:
            with open(self.schema_path, "r", encoding="utf-8") as f:
                schema = f.read()
            await db.executescript(schema)
            await db.commit()

    async def create_session(self, title: str = "New Session") -> str:
        """Creates a new chat session and returns its ID."""
        session_id = str(uuid.uuid4())
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO sessions (id, title) VALUES (?, ?)", 
                (session_id, title)
            )
            await db.commit()
        return session_id

    async def get_sessions(self) -> List[Dict[str, Any]]:
        """Retrieves all chat sessions ordered by newest first."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM sessions ORDER BY updated_at DESC") as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

    async def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Adds a message to a specific session."""
        msg_id = str(uuid.uuid4())
        meta_json = json.dumps(metadata) if metadata else None
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO messages (id, session_id, role, content, metadata) VALUES (?, ?, ?, ?, ?)",
                (msg_id, session_id, role, content, meta_json)
            )
            # Update session's updated_at timestamp
            await db.execute(
                "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (session_id,)
            )
            await db.commit()
        return msg_id

    async def get_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """Retrieves all messages for a specific session ordered chronologically."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,)) as cursor:
                rows = await cursor.fetchall()
                results = []
                for row in rows:
                    r_dict = dict(row)
                    if r_dict["metadata"]:
                        r_dict["metadata"] = json.loads(r_dict["metadata"])
                    results.append(r_dict)
                return results

    async def update_session_title(self, session_id: str, title: str):
         """Updates the title of a specific session."""
         async with aiosqlite.connect(self.db_path) as db:
             await db.execute(
                 "UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                 (title, session_id)
             )
             await db.commit()
             
    async def delete_session(self, session_id: str):
        """Deletes a session and its associated messages (cascades)."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON")
            await db.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            await db.commit()

    async def add_log(self, type: str, source: str, message: str):
        """Record a system operation log."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO system_logs (type, source, message) VALUES (?, ?, ?)",
                (type, source, message)
            )
            await db.commit()

    async def get_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve recent system logs."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT ?", (limit,)) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

# Singleton instance
sqlite_service = SQLiteService()
