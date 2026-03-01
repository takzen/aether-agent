import asyncio
from agent import get_agent_response
from local_db import sqlite_service

async def main():
    print("[Aether Engine] Initiating Project 1: Mycelium-Neural Bridge...")
    
    # 1. Starting research
    prompt = """
    Start Project 1: Mycelium-Neural Bridge. 
    Task: Conduct an initial research on the parallels between Mycelial Networks (Wood Wide Web) and Human Neural Networks.
    1. Perform a web search for scientific articles or news on 'mycelium vs neural networks'.
    2. Identify at least 3 structural or functional commonalities (e.g., decentralized communication, nutrient/data transport, adaptive growth).
    3. Use 'connect_concepts' tool to map these in our Knowledge Graph.
    4. Provide a philosophical summary of your initial findings.
    """
    
    response = await get_agent_response(prompt)
    print("\n--- AETHER CORE RESPONSE ---")
    print(response.response)
    print(f"Confidence: {response.confidence_score}")
    print(f"Reasoning: {response.reasoning_type}")
    print("----------------------------\n")

if __name__ == "__main__":
    asyncio.run(main())
