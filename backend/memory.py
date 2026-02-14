"""
This module handles memory operations:
1. Converting text to vector embeddings using Google Generative AI.
2. Interfacing with DatabaseService to store/retrieve memories.
"""
import os
import asyncio
from typing import List, Optional
from google import genai
from google.genai import types
from datetime import datetime
from dotenv import load_dotenv

# Load env variables if not already loaded
load_dotenv()

class MemoryManager:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.client = genai.Client(api_key=api_key)
        # Using the standard embedding model with full path
        self.embedding_model = "models/text-embedding-004"

    async def get_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for the given text using Gemini API.
        """
        try:
            # The new genai SDK uses models.embed_content
            # We run it in an executor because the sync client is blocking, 
            # and we want to keep the async loop happy if we call this from async code.
            # However, google.genai has an async client too, but let's stick to safe usage.
            
            # Using the simplified method driven by Google's latest SDK docs
            result = self.client.models.embed_content(
                model=self.embedding_model,
                contents=text
            )
            
            # Extract embedding from response
            if result.embedding:
                return result.embedding.values
            return []
            
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    async def add_memory(self, db_service, content: str, metadata: dict = None):
        """
        High-level function to:
        1. Embed the content.
        2. Save to Supabase via DatabaseService.
        """
        print(f"[MemoryManager] Generating embedding for: '{content[:30]}...'")
        embedding = await self.get_embedding(content)
        
        if not embedding:
            print("[MemoryManager] Failed to generate embedding.")
            return None

        # Call the database service to insert asynchronously
        # Since db_service methods are synchronous (ChromaDB), we run them in a thread.
        result = await asyncio.to_thread(
            db_service.add_memory,
            content=content,
            embedding=embedding,
            metadata=metadata or {}
        )
        return result

    async def search_relevant_memories(self, db_service, query: str, limit: int = 5, similarity_threshold: float = 0.5):
        """
        1. Embed the search query.
        2. Call DatabaseService to find similar vectors.
        """
        print(f"[MemoryManager] Embedding query: '{query}'")
        query_embedding = await self.get_embedding(query)
        
        if not query_embedding:
            return []

        # Search in DB (ThreadPoolExecutor)
        results = await asyncio.to_thread(
            db_service.search_memories,
            query_embedding=query_embedding,
            match_threshold=similarity_threshold,
            match_count=limit
        )
        return results

# Singleton instance to be used across the app
memory_manager = MemoryManager()
