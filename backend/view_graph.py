import asyncio
from local_db import sqlite_service
import json

async def main():
    graph = await sqlite_service.get_concept_graph()
    print("Nodes:")
    for n in graph['nodes']:
        print(f" - {n['name']} ({n['type']})")
    
    print("\nLinks:")
    for l in graph['links']:
        print(f" - {l['source_name']} --[{l['relation']}]--> {l['target_name']}")

if __name__ == "__main__":
    asyncio.run(main())
