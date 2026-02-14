"""
Vector Store Service - RAG for Agent Memory
Uses pgvector in Supabase for semantic search of past debates.
"""

import os
from google import genai
from google.genai import types
from typing import Optional
from app.supabase_client import supabase

# Configure Gemini client
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding vector using Gemini embedding model."""
    if not client:
        print("[VECTOR] No Gemini client configured")
        return []
    try:
        result = client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=768
            )
        )
        return list(result.embeddings[0].values)
    except Exception as e:
        print(f"[VECTOR] Error generating embedding: {e}")
        return []


async def store_debate_embedding(
    debate_id: str,
    title: str,
    summary: str,
    tags: list[str]
) -> bool:
    """Store debate embedding in Supabase pgvector table."""
    try:
        # Combine text for embedding
        combined_text = f"{title}. {summary}. Tags: {', '.join(tags)}"
        
        embedding = await generate_embedding(combined_text)
        if not embedding:
            return False
        
        # Store in Supabase
        result = supabase.table('debate_embeddings').upsert({
            'debate_id': debate_id,
            'content': combined_text[:1000],  # Limit content length
            'embedding': embedding,
            'metadata': {'tags': tags, 'title': title}
        }).execute()
        
        print(f"[VECTOR] Stored embedding for debate: {debate_id}")
        return True
    except Exception as e:
        print(f"[VECTOR] Error storing embedding: {e}")
        return False


async def find_similar_debates(
    query: str,
    limit: int = 5,
    similarity_threshold: float = 0.7
) -> list[dict]:
    """Find similar debates using semantic search."""
    try:
        query_embedding = await generate_embedding(query)
        if not query_embedding:
            return []
        
        # Use Supabase RPC for vector similarity search
        result = supabase.rpc('match_debates', {
            'query_embedding': query_embedding,
            'match_threshold': similarity_threshold,
            'match_count': limit
        }).execute()
        
        return result.data if result.data else []
    except Exception as e:
        print(f"[VECTOR] Error finding similar debates: {e}")
        return []


async def check_duplicate(
    title: str,
    summary: str,
    threshold: float = 0.85
) -> Optional[dict]:
    """Check if a similar debate already exists."""
    combined = f"{title}. {summary}"
    similar = await find_similar_debates(combined, limit=1, similarity_threshold=threshold)
    
    if similar and len(similar) > 0:
        return similar[0]
    return None


async def get_context_for_debate(topic: str, limit: int = 3) -> str:
    """Get relevant context from past debates for RAG."""
    similar = await find_similar_debates(topic, limit=limit, similarity_threshold=0.6)
    
    if not similar:
        return ""
    
    context_parts = []
    for debate in similar:
        context_parts.append(f"- {debate.get('content', '')}")
    
    return "KONTEKST Z POPRZEDNICH DEBAT:\n" + "\n".join(context_parts)
