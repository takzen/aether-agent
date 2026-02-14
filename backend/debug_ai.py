from agent import aether_agent
import asyncio

async def debug_messages():
    result = await aether_agent.run("Hi")
    print(f"Result type: {type(result)}")
    for m in result.new_messages():
        print(f"Message type: {type(m)}")
        print(f"Attributes: {dir(m)}")
        try:
            print(f"Model Dump: {m.model_dump()}")
        except Exception as e:
            print(f"Model Dump failed: {e}")

if __name__ == "__main__":
    asyncio.run(debug_messages())
