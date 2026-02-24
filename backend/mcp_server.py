import os
import sys
import asyncio
from dotenv import load_dotenv

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Błąd: Pudełko mcp-server-sdk nie jest zainstalowane. Uruchom: uv add mcp")
    sys.exit(1)

# Ensure paths correctly resolve to Aether backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from local_db import sqlite_service

# Load Aether environments
load_dotenv()

# Inicjalizacja serwera MCP
mcp = FastMCP("Aether Core MCP")

@mcp.tool()
async def get_latest_aether_thoughts(limit: int = 20) -> str:
    """
    Pobiera najświeższe logi systemowe i działania z Mózgu Aethera (Z pamięci krótkotrwałej SQLite).
    Używaj tego, by sprawdzić co przed chwilą robił system i do jakich doszedł technicznych wniosków.
    """
    logs = await sqlite_service.get_logs(limit=limit)
    if not logs:
        return "Brak zapisów w pamięci Mózgu Aethera."
    
    result = []
    for log in logs:
        result.append(f"[{log['type'].upper()} | {log['source']}] {log['message']}")
    
    return "\n".join(result)

@mcp.tool()
async def get_aether_morning_brief() -> str:
    """
    Pobiera najnowszy Raport Poranny z cyklu nocnego (Sleep Cycle).
    To niezwykle ważne podsumowanie stanu systemu po wektorowej konsolidacji grafu wiedzy.
    """
    logs = await sqlite_service.get_logs(limit=100)
    for log in logs:
        if log["type"] == "brief":
            return log["message"]
            
    return "Nie odbył się jeszcze żaden Sleep Cycle (Brak Raportu w bazie)."

if __name__ == "__main__":
    print("[MCP Server] Uruchamiam złącze Model Context Protocol dla Aether Core...")
    mcp.run()
