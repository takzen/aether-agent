
import os
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

async def test_embedding():
    key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=key)
    
    try:
        print("Testing with output_dimensionality=768...")
        result = client.models.embed_content(
            model="models/gemini-embedding-001",
            contents="test text",
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=768
            )
        )
        vector = result.embeddings[0].values
        print(f"SUCCESS! Vector length: {len(vector)}")
        if len(vector) == 768:
            print("Dimensionality matches Supabase schema.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_embedding())
