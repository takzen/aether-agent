import asyncio
from local_db import sqlite_service
from database import DatabaseService

async def final_clear():
    db = DatabaseService()
    try:
        # 1. Clear SQLite
        print("Clearing SQLite (sessions, graph, logs)...")
        await sqlite_service.clear_database()
        
        # 2. Clear Qdrant
        print("Clearing Qdrant vector collections...")
        db.clear_all()
        
        # 3. Verify
        sessions = await sqlite_service.get_sessions()
        graph = await sqlite_service.get_concept_graph()
        stats = db.get_stats()
        
        print(f"\nSTATUS REPORT AFTER CLEANUP:")
        print(f"Sessions: {len(sessions)}")
        print(f"Graph Nodes: {len(graph['nodes'])}")
        print(f"Vector Memories: {stats.get('memories_count', 0)}")
        print("RESULT: FULLY_CLEAN_STATE")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(final_clear())
