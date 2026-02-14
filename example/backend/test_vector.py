
import os
import asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv()

async def test_embedding():
    key = os.environ.get("GEMINI_API_KEY")
    print(f"Using key: {key[:10]}...")
    client = genai.Client(api_key=key)
    
    try:
        print("Generating embedding...")
        result = client.models.embed_content(
            model="text-embedding-004", # Let's try the newer model too or the one from code
            contents="test text",
        )
        print("Success! Embedding length:", len(result.embeddings[0].values))
        
        print("Testing with model from code (gemini-embedding-001)...")
        result2 = client.models.embed_content(
            model="gemini-embedding-001",
            contents="test text",
        )
        print("Success! Embedding length:", len(result2.embeddings[0].values))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_embedding())
