
import asyncio
from database import DatabaseService
from memory import memory_manager

async def main():
    db = DatabaseService()
    
    # 1. Connect to DB
    print("Database connected.")
    
    # 2. Get user query
    query = input("Enter query: ")
    
    # 3. Embed query
    print(f"Embedding query: '{query}'")
    query_embedding = await memory_manager.get_embedding(query)
    
    if not query_embedding:
        print("Failed to embed query.")
        return

    # 4. Search 'memories' collection
    print("\n--- Memories ---")
    memories = db.search_memories(query_embedding, match_count=3)
    for m in memories:
        print(f"- {m['content']} (Score: {m['similarity']:.2f})")
        
    # 5. Search 'documents' collection
    print("\n--- Documents ---")
    documents = db.search_documents(query_embedding, match_count=3)
    for d in documents:
        print(f"- {d['content'][:100]}... (Score: {d['similarity']:.2f})")
        
if __name__ == "__main__":
    asyncio.run(main())
