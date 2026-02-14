
import asyncio
from memory import MemoryManager

async def test_embedding():
    try:
        mm = MemoryManager()
        text = "Hello world"
        embedding = await mm.get_embedding(text)
        print(f"Embedding generated! Length: {len(embedding)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_embedding())
