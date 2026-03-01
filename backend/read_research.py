import asyncio
from local_db import sqlite_service
import json

async def main():
    logs = await sqlite_service.get_logs(limit=20)
    for l in reversed(logs):
        print(f"[{l['source']}] {l['message']}")
        
    sessions = await sqlite_service.get_sessions()
    if sessions:
        msgs = await sqlite_service.get_messages(sessions[0]['id'])
        print("\n--- LATEST MESSAGE ---")
        print(msgs[-1]['content'])

if __name__ == "__main__":
    asyncio.run(main())
