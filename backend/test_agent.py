import asyncio
from agent import aether_agent
import os
from dotenv import load_dotenv

load_dotenv()

async def test_agent():
    print(f"Using Model: {os.getenv('GEMINI_API_KEY')[:10]}...")
    try:
        result = await aether_agent.run("Powiedz 'Aether system online' jeśli mnie słyszysz.")
        print(f"Response: {result.data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_agent())
