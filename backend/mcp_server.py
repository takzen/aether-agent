import os
import sys
import asyncio
from dotenv import load_dotenv

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Error: The mcp-server-sdk package is not installed. Run: uv add mcp")
    sys.exit(1)

# Ensure paths correctly resolve to Aether backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from local_db import sqlite_service

# Load Aether environments
load_dotenv()

# Initialize MCP server
mcp = FastMCP("Aether Core MCP")

@mcp.tool()
async def get_latest_aether_thoughts(limit: int = 20) -> str:
    """
    Retrieves the freshest system logs and actions from Aether's Brain (Short-term SQLite memory).
    Use this to check what the system was recently doing and its technical conclusions.
    """
    logs = await sqlite_service.get_logs(limit=limit)
    if not logs:
        return "No records found in Aether's Brain memory."
    
    result = []
    for log in logs:
        result.append(f"[{log['type'].upper()} | {log['source']}] {log['message']}")
    
    return "\n".join(result)

@mcp.tool()
async def get_aether_morning_brief() -> str:
    """
    Retrieves the latest Morning Brief from the Sleep Cycle.
    This is an extremely important summary of the system state after vector knowledge graph consolidation.
    """
    logs = await sqlite_service.get_logs(limit=100)
    for log in logs:
        if log["type"] == "brief":
            return log["message"]
            
    return "No Sleep Cycle has occurred yet (No Report in database)."

if __name__ == "__main__":
    print("[MCP Server] Starting Model Context Protocol connection for Aether Core...")
    mcp.run()
