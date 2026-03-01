import asyncio
import aiosqlite
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

class SQLiteService:
    def __init__(self, db_path: str = None, schema_path: str = None):
        import os
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = db_path or os.path.join(base_dir, "aether.db")
        self.schema_path = schema_path or os.path.join(base_dir, "schema.sql")

    async def init_db(self) -> bool:
        """Initializes the SQLite database. Returns True if it was a cold start (file didn't exist)."""
        import os
        is_new = not os.path.exists(self.db_path)
        
        async with aiosqlite.connect(self.db_path) as db:
            with open(self.schema_path, "r", encoding="utf-8") as f:
                schema = f.read()
            await db.executescript(schema)
            await db.commit()
        return is_new

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

    async def get_logs(self, limit: int = 100, from_id: int = 0) -> List[Dict[str, Any]]:
        """Retrieve recent system logs since a certain ID."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            query = "SELECT * FROM system_logs WHERE id > ? ORDER BY id DESC LIMIT ?"
            async with db.execute(query, (from_id, limit)) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
                
    async def get_settings(self) -> Dict[str, Any]:
        """Retrieve all application settings."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT key, value FROM settings") as cursor:
                rows = await cursor.fetchall()
                # Default settings if none found
                current = {
                    "COGNITION_PERSONA": "Balanced",
                    "COGNITION_AUTONOMY": "2",
                    "COGNITION_CREATIVITY": "60",
                    "COGNITION_REFLECTION": "true",
                    "COGNITION_CIRCADIAN_LOCK": "false"
                }
                for row in rows:
                    current[row['key']] = row['value']
                return current

    async def set_setting(self, key: str, value: Any):
        """Set a single application setting."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP",
                (key, str(value))
            )
            await db.commit()

    # --- AGENT SKILLS ---

    async def list_agent_skills(self) -> List[Dict[str, Any]]:
        """Retrieves all agent skills ordered by latest updated."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM agent_skills ORDER BY updated_at DESC, created_at DESC") as cursor:
                rows = await cursor.fetchall()
                result = []
                for row in rows:
                    item = dict(row)
                    item["enabled"] = bool(item.get("enabled", 0))
                    result.append(item)
                return result

    async def create_agent_skill(
        self,
        name: str,
        purpose: str,
        triggers: str,
        instructions: str,
        enabled: bool = True
    ) -> Dict[str, Any]:
        """Creates an agent skill and returns created row."""
        skill_id = str(uuid.uuid4())
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT INTO agent_skills (id, name, purpose, triggers, instructions, enabled)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (skill_id, name, purpose, triggers, instructions, 1 if enabled else 0)
            )
            await db.commit()

            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM agent_skills WHERE id = ?", (skill_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    raise RuntimeError("Failed to create skill.")
                item = dict(row)
                item["enabled"] = bool(item.get("enabled", 0))
                return item

    async def toggle_agent_skill(self, skill_id: str, enabled: bool) -> Optional[Dict[str, Any]]:
        """Toggles skill enabled state and returns updated row."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE agent_skills SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (1 if enabled else 0, skill_id)
            )
            await db.commit()

            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM agent_skills WHERE id = ?", (skill_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    return None
                item = dict(row)
                item["enabled"] = bool(item.get("enabled", 0))
                return item

    async def delete_agent_skill(self, skill_id: str) -> bool:
        """Deletes skill by id."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("DELETE FROM agent_skills WHERE id = ?", (skill_id,))
            await db.commit()
            return cursor.rowcount > 0
            
    async def get_checkpoint(self, module_key: str) -> int:
        """Gets the last processed log ID for a module."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT last_log_id FROM system_checkpoints WHERE module_key = ?", (module_key,)) as cursor:
                row = await cursor.fetchone()
                return row['last_log_id'] if row else 0

    async def set_checkpoint(self, module_key: str, log_id: int):
        """Sets the last processed log ID for a module."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO system_checkpoints (module_key, last_log_id, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(module_key) DO UPDATE SET last_log_id=excluded.last_log_id, updated_at=CURRENT_TIMESTAMP",
                (module_key, log_id)
            )
            await db.commit()

    # --- GRAPH MEMORY (CONSTELLATIONS) ---

    async def upsert_concept(self, name: str, c_type: str = 'general', description: str = None, metadata: Dict = None, confidence: float = 1.0, vector_id: str = None) -> str:
        """Adds or updates a concept node with CORE-X enhancements."""
        concept_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, name.lower()))
        meta_json = json.dumps(metadata) if metadata else None
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT INTO concepts (id, name, type, description, metadata, confidence, vector_id, last_activated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                   ON CONFLICT(name) DO UPDATE SET 
                     type=excluded.type, 
                     description=COALESCE(excluded.description, concepts.description),
                     metadata=COALESCE(excluded.metadata, concepts.metadata),
                     confidence=COALESCE(excluded.confidence, concepts.confidence),
                     vector_id=COALESCE(excluded.vector_id, concepts.vector_id),
                     last_activated_at=CURRENT_TIMESTAMP""",
                (concept_id, name, c_type, description, meta_json, confidence, vector_id)
            )
            await db.commit()
        return concept_id

    async def add_concept_link(self, source_name: str, target_name: str, relation: str, weight: float = 1.0):
        """Creates a link between two concepts by name."""
        s_id = await self.upsert_concept(source_name)
        t_id = await self.upsert_concept(target_name)
        link_id = str(uuid.uuid4())

        async with aiosqlite.connect(self.db_path) as db:
            # We also update last_activated_at for BOTH concepts being linked
            await db.execute("UPDATE concepts SET last_activated_at = CURRENT_TIMESTAMP WHERE id IN (?, ?)", (s_id, t_id))
            
            await db.execute(
                """INSERT INTO concept_links (id, source_id, target_id, relation, weight)
                   VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT(source_id, target_id, relation) DO UPDATE SET weight = weight + 0.1""",
                (link_id, s_id, t_id, relation, weight)
            )
            await db.commit()

    async def get_concept_graph(self) -> Dict[str, Any]:
        """Returns the full graph (nodes and edges)."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            
            # Nodes
            async with db.execute("SELECT * FROM concepts") as cursor:
                nodes = [dict(row) for row in await cursor.fetchall()]
                for n in nodes:
                    if n["metadata"]: n["metadata"] = json.loads(n["metadata"])

            # Edges
            async with db.execute(
                """SELECT l.*, s.name as source_name, t.name as target_name 
                   FROM concept_links l
                   JOIN concepts s ON l.source_id = s.id
                   JOIN concepts t ON l.target_id = t.id"""
            ) as cursor:
                links = [dict(row) for row in await cursor.fetchall()]

            return {"nodes": nodes, "links": links}

    async def query_concept_neighborhood(self, concept_name: str, depth: int = 1, relation_type: str = None) -> List[Dict[str, Any]]:
        """
        Queries the graph neighborhood for a specific concept name.
        Returns a list of links (edges) found within the specified depth.
        """
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            
            # 1. Normalize name and find starting concept ID
            async with db.execute("SELECT id, name FROM concepts WHERE name = ? COLLATE NOCASE", (concept_name,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    return []
                start_id = row['id']

            # 2. Recursive CTE to find related concepts and their links
            # We limit depth to 3 maximum to prevent massive responses or infinite recursion
            depth = min(max(1, depth), 3)
            
            relation_clause = ""
            if relation_type:
                relation_clause = "AND l.relation = :rel_type"

            query = f"""
            WITH RECURSIVE
              neighbor_nodes(id, level) AS (
                SELECT :start_id, 0
                UNION
                SELECT 
                  CASE WHEN l.source_id = n.id THEN l.target_id ELSE l.source_id END,
                  n.level + 1
                FROM concept_links l
                JOIN neighbor_nodes n ON (l.source_id = n.id OR l.target_id = n.id)
                WHERE n.level < :depth
                {relation_clause}
              )
            SELECT DISTINCT 
                l.id, l.relation, l.weight, l.metadata, l.created_at,
                s.name as source_name, t.name as target_name
            FROM concept_links l
            JOIN concepts s ON l.source_id = s.id
            JOIN concepts t ON l.target_id = t.id
            WHERE (l.source_id IN (SELECT id FROM neighbor_nodes) 
               OR l.target_id IN (SELECT id FROM neighbor_nodes))
            {relation_clause}
            ORDER BY l.weight DESC
            """
            
            params = {"start_id": start_id, "depth": depth}
            if relation_type:
                params["rel_type"] = relation_type

            async with db.execute(query, params) as cursor:
                rows = await cursor.fetchall()
                links = [dict(row) for row in rows]
                
                # Parse metadata if exists
                for link in links:
                    if link.get("metadata"):
                        try:
                            link["metadata"] = json.loads(link["metadata"])
                        except:
                            pass
                return links

    async def clear_logs(self):
        """Clears all system logs."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM system_logs")
            await db.commit()

    async def clear_database(self):
        """Clears all data from the database (concepts, links, sessions, logs)."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON")
            await db.execute("DELETE FROM concepts")
            await db.execute("DELETE FROM concept_links")
            await db.execute("DELETE FROM messages")
            await db.execute("DELETE FROM agent_skills")
            await db.execute("DELETE FROM sessions")
            await db.execute("DELETE FROM system_logs")
            await db.execute("DELETE FROM system_checkpoints")
            await db.commit()

# Singleton instance
sqlite_service = SQLiteService()
