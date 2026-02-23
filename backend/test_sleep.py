import asyncio
from sleep_cycle import run_sleep_cycle

async def main():
    res = await run_sleep_cycle()
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
