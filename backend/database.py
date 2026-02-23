"""
Database Service using Qdrant Cloud for vector storage.
This replaces the ChromaDB implementation for better scalability and cloud persistence.
"""
import os
import uuid
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams, PointStruct

load_dotenv()

class DatabaseService:
    def __init__(self):
        # Initialize Qdrant client (Hybrid Mode: Cloud or Local Storage)
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        local_path = os.getenv("QDRANT_LOCAL_PATH", "./qdrant_storage")
        
        if url and api_key:
            print(f"[Database] Qdrant Cloud detected. Connecting to: {url}")
            self.client = QdrantClient(url=url, api_key=api_key)
        else:
            print(f"[Database] Using Local Qdrant (No-Docker) at: {local_path}")
            # This uses the embedded Qdrant engine (Rust) directly in the process
            self.client = QdrantClient(path=local_path)
        
        # Dimensions for Gemini Embedding 001 are 3072
        self.vector_size = 3072
        
        # Ensure collections exist
        self._ensure_collection("memories")
        self._ensure_collection("documents")
        
        print(f"[Database] Qdrant Cloud initialized. Base URL: {url}")

    def _ensure_collection(self, collection_name: str):
        """Creates the collection if it doesn't already exist."""
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == collection_name for c in collections)
            
            if not exists:
                print(f"[Database] Creating collection: '{collection_name}'")
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE),
                )
            else:
                print(f"[Database] Collection '{collection_name}' already exists.")
        except Exception as e:
            print(f"[Database] Error checking/creating collection '{collection_name}': {e}")

    def add_memory(self, content: str, embedding: List[float], metadata: Dict[str, Any] = None):
        """Adds a memory to the memories collection."""
        return self._add_to_collection("memories", content, embedding, metadata, "memory")

    def add_document_chunk(self, content: str, embedding: List[float], metadata: Dict[str, Any] = None):
        """Adds a document chunk to the documents collection."""
        return self._add_to_collection("documents", content, embedding, metadata, "document_chunk")

    def _add_to_collection(self, collection_name: str, content: str, embedding: List[float], metadata: Dict[str, Any], item_type: str):
        point_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        payload = metadata or {}
        payload["content"] = content # Qdrant stores text in payload
        payload["timestamp"] = timestamp
        payload["type"] = item_type

        try:
            self.client.upsert(
                collection_name=collection_name,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload=payload
                    )
                ]
            )
            print(f"[Database] {item_type.replace('_', ' ').capitalize()} added: {point_id}")
            return {"id": point_id, "status": "success"}
        except Exception as e:
            print(f"[Database] Error adding {item_type} to Qdrant: {e}")
            return {"status": "error", "message": str(e)}

    def search_memories(self, query_embedding: List[float], match_threshold: float = 0.5, match_count: int = 5):
        """Searches the memories collection."""
        return self._search_collection("memories", query_embedding, match_threshold, match_count)

    def search_documents(self, query_embedding: List[float], match_threshold: float = 0.5, match_count: int = 5):
        """Searches the documents collection."""
        return self._search_collection("documents", query_embedding, match_threshold, match_count)

    def _search_collection(self, collection_name: str, query_embedding: List[float], match_threshold: float, match_count: int):
        try:
            response = self.client.query_points(
                collection_name=collection_name,
                query=query_embedding,
                limit=match_count,
                with_payload=True
            )
            
            formatted_results = []
            for hit in response.points:
                if hit.score >= match_threshold:
                    payload = hit.payload or {}
                    content = payload.pop("content", "")
                    
                    formatted_results.append({
                        "id": hit.id,
                        "content": content,
                        "similarity": hit.score,
                        "metadata": payload
                    })
            
            return formatted_results

        except Exception as e:
            print(f"[Database] Error searching Qdrant collection '{collection_name}': {e}")
            return []

    def get_stats(self):
        """Returns statistics about the database."""
        try:
            memories_count = self.client.count(collection_name="memories").count
            documents_count = self.client.count(collection_name="documents").count
            return {
                "memories_count": memories_count,
                "documents_count": documents_count
            }
        except Exception as e:
            print(f"[Database] Error getting Qdrant stats: {e}")
            return {"memories_count": 0, "documents_count": 0}

    def delete_memory(self, memory_id: str):
        """Deletes a memory by its point ID."""
        try:
            self.client.delete(
                collection_name="memories",
                points_selector=models.PointIdsList(points=[memory_id])
            )
            print(f"[Database] Deleted memory from Qdrant: {memory_id}")
            return True
        except Exception as e:
            print(f"[Database] Error deleting memory {memory_id} from Qdrant: {e}")
            return False

    def list_memories(self):
        """Returns a list of all memories."""
        try:
            scroll_result = self.client.scroll(
                collection_name="memories",
                limit=1000,
                with_payload=True,
                with_vectors=False
            )
            points = scroll_result[0]
            if not points:
                return []
            
            return [{
                "id": point.id,
                "content": point.payload.get("content", ""),
                "category": point.payload.get("category", "general"),
                "timestamp": point.payload.get("timestamp", "")
            } for point in points]
        except Exception as e:
            print(f"[Database] Error listing memories from Qdrant: {e}")
            return []

    def delete_document(self, filename: str):
        """Deletes all chunks associated with a specific file source."""
        try:
            self.client.delete(
                collection_name="documents",
                points_selector=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="source",
                            match=models.MatchValue(value=filename),
                        ),
                    ],
                ),
            )
            print(f"[Database] Deleted document from Qdrant: {filename}")
            return True
        except Exception as e:
            print(f"[Database] Error deleting document {filename} from Qdrant: {e}")
            return False

    def list_documents(self):
        """Returns a list of unique document sources (filenames) in the collection."""
        try:
            # Scroll through all points but only request 'source' metadata
            # For simplicity, we limit to 1000 items as we don't expect millions yet
            scroll_result = self.client.scroll(
                collection_name="documents",
                limit=1000,
                with_payload=True,
                with_vectors=False
            )
            
            points = scroll_result[0]
            if not points:
                return []
            
            sources = {}
            for point in points:
                src = point.payload.get("source")
                if src:
                    # Store latest metadata for each source
                    sources[src] = point.payload
            
            return [{"filename": src, "metadata": meta} for src, meta in sources.items()]
        except Exception as e:
            print(f"[Database] Error listing documents from Qdrant: {e}")
            return []
