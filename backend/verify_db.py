import asyncio
from local_db import sqlite_service
from database import DatabaseService

async def verify_cleanliness():
    db = DatabaseService()
    try:
        sessions = await sqlite_service.get_sessions()
        graph = await sqlite_service.get_concept_graph()
        logs = await sqlite_service.get_logs(limit=10)
        stats = db.get_stats()
        
        print(f"--- DATABASE CLEANLINESS REPORT ---")
        print(f"Sessions: {len(sessions)}")
        print(f"Graph Nodes: {len(graph['nodes'])}")
        print(f"Graph Links: {len(graph['links'])}")
        print(f"System Logs: {len(logs)}")
        print(f"Vector Memories: {stats.get('memories_count', 0)}")
        print(f"Vector Docs: {stats.get('documents_count', 0)}")
        print(f"--- END OF REPORT ---")
    except Exception as e:
        print(f"ERROR_DURING_VERIFICATION: {e}")

if __name__ == "__main__":
    asyncio.run(verify_cleanliness())
