import json
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from config import get_config
from local_db import sqlite_service
from agent import model

class WorldInsight(BaseModel):
    insight: str = Field(description="Main conclusion about the project development direction based on telemetry.")
    suggested_action: str = Field(description="Proposed optimization or proactive fix action for Aether.")

world_agent = Agent(
    model=model,
    system_prompt="Identity: Aether WorldModel", 
    retries=3,
    output_type=WorldInsight
)

@world_agent.system_prompt
async def inject_world_language(ctx: RunContext[dict]) -> str:
    conf = get_config()
    lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
    
    if lang == "en":
        return (
            "You are the Aether Active World Model (AWM). Respond in ENGLISH. "
            "Analyze logs for patterns, blockers, and hidden connections."
        )
    else:
        return (
            "Jesteś modułem Aether Active World Model (AWM). Odpowiadaj WYŁĄCZNIE PO POLSKU. "
            "Analizuj logi pod kątem wzorców, blokad i ukrytych powiązań."
        )

async def run_active_world_model_simulation():
    logs = await sqlite_service.get_logs(limit=30)
    
    if len(logs) < 5:
        conf = get_config()
        lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
        if lang == "en":
            return {
                "insight": "Insufficient telemetry data to run a deep AWM simulation.",
                "suggested_action": "Continue working, gather more informational logs and user inputs."
            }
        else:
            return {
                "insight": "Niewystarczająca ilość danych telemetrycznych do przeprowadzenia głębokiej symulacji AWM.",
                "suggested_action": "Kontynuuj pracę, zbierz więcej logów informacyjnych i danych od użytkownika."
            }
        
    prompt = "--- INITIATING AWM SIMULATION BASED ON THE FOLLOWING EVENTS ---\n"
    for log in logs:
        prompt += f"[{log['type'].upper()}|{log['source']}] {log['message']}\n"
        
    try:
        result = await world_agent.run(prompt)
        data = result.output.model_dump()
        
        await sqlite_service.add_log(
            type="awm", 
            source="WORLD_MODEL", 
            message=json.dumps(data)
        )
        
        return data
        
    except Exception as e:
        print(f"[ActiveWorldModel] Background simulation error: {repr(e)}")
        return {
            "insight": f"<AWM ERROR> Symulacja przerwana: {str(e)}",
            "suggested_action": "Sprawdź diagnostykę PydanticAI."
        }
