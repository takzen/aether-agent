"""
Database Service using local ChromaDB for vector storage.
This replaces the Supabase implementation to ensure data sovereignty and avoid cloud limits.
"""
import chromadb
from typing import List, Dict, Any
from datetime import datetime
import uuid

class DatabaseService:
    def __init__(self):
        # Initialize local persistent client in ./aether_memory directory
        self.client = chromadb.PersistentClient(path="./aether_memory")
        
        # Get or create the collection for memories
        # Using cosine distance by default (hnsw:space usually defaults to l2, let's stick to defaults for now)
        self.collection = self.client.get_or_create_collection(
            name="memories",
            metadata={"hnsw:space": "cosine"}
        )
        print("[Database] ChromaDB initialized locally at ./aether_memory")

    def add_memory(self, content: str, embedding: List[float], metadata: Dict[str, Any] = None):
        """
        Adds a memory to the ChromaDB collection.
        """
        mem_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Prepare metadata
        meta = metadata or {}
        meta["timestamp"] = timestamp
        meta["type"] = "memory"

        try:
            self.collection.add(
                documents=[content],
                embeddings=[embedding],
                metadatas=[meta],
                ids=[mem_id]
            )
            print(f"[Database] Memory added: {mem_id}")
            return {"id": mem_id, "status": "success"}
        except Exception as e:
            print(f"[Database] Error adding memory: {e}")
            return {"status": "error", "message": str(e)}

    def search_memories(self, query_embedding: List[float], match_threshold: float = 0.5, match_count: int = 5):
        """
        Searches for similar memories using the query embedding.
        Returns a list of simplified memory objects.
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=match_count
                # where={"metadata_field": "is_equal_to_this"}, # Optional filtering
            )
            
            # Format results to match previous interface
            formatted_results = []
            
            # Chroma returns lists of lists (one per query)
            if results["ids"]:
                for i, mem_id in enumerate(results["ids"][0]):
                    distance = results["distances"][0][i]
                    # Convert distance to similarity score (approximate for cosine)
                    similarity = 1 - distance 
                    
                    if similarity >= match_threshold:
                        formatted_results.append({
                            "id": mem_id,
                            "content": results["documents"][0][i],
                            "similarity": similarity,
                            "metadata": results["metadatas"][0][i]
                        })
            
            return formatted_results

        except Exception as e:
            print(f"[Database] Error searching memories: {e}")
            return []
    
    # Placeholder for non-vector methods if needed (e.g. simple key-value store in future)
