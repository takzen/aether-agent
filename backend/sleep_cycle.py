import json
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from config import get_config
from local_db import sqlite_service
from agent import model

class MorningBrief(BaseModel):
    brief: str = Field(description="A technical, short summary of the telemetry data from a data fusion perspective.")
    points: list[str] = Field(description="2-3 specific insights, warnings, or action proposals based on the logs.")

sleep_agent = Agent(
    model=model,
    system_prompt="Identity: Aether NightCycleProcessor", 
    retries=3,
    output_type=MorningBrief
)

@sleep_agent.system_prompt
async def inject_sleep_language(ctx: RunContext[dict]) -> str:
    conf = get_config()
    lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
    
    if lang == "en":
        return (
            "You are the Aether NightCycleProcessor module. Respond in ENGLISH. "
            "Analyze system logs and prepare a Concise Morning Brief."
        )
    else:
        return (
            "Jesteś modułem Aether NightCycleProcessor. Odpowiadaj WYŁĄCZNIE PO POLSKU. "
            "Przeanalizuj logi systemowe i przygotuj zwięzły Morning Brief (Poranny Raport)."
        )

async def run_sleep_cycle():
    # Fetch the newest system logs
    logs = await sqlite_service.get_logs(limit=50)
    
    if not logs:
        conf = get_config()
        lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
        if lang == "en":
            return {
                "brief": "Aether Core updated. No new logs from the past cycle. Modules are in standby.",
                "points": ["Core systems Online.", "Vector memory synchronized."]
            }
        else:
            return {
                "brief": "Rdzeń Aether zaktualizowany. Brak nowych logów z ostatniego cyklu. Moduły w trybie gotowości.",
                "points": ["Systemy bazowe Online.", "Pamięć wektorowa zsynchronizowana."]
            }
        
    prompt = "Analyze this telemetry data and generate a JSON report:\n"
    for log in logs:
        prompt += f"[{log['type'].upper()}|{log['source']}] {log['message']}\n"
        
    try:
        result = await sleep_agent.run(prompt)
        data = result.output.model_dump()
        
        await sqlite_service.add_log("brief", "SLEEP_CYCLE", json.dumps(data))
        await sqlite_service.add_log("info", "SLEEP_CYCLE", "Completed nightly graph and log consolidation.")
        
        return data
        
    except Exception as e:
        print(f"[SleepCycle] Error running night cycle: {repr(e)}")
        return {
            "brief": "Aether Core zaktualizowany, lecz proces konsolidacji wektorowej został przerwany przez awarię parsowania.",
            "points": [f"Debug: {str(e)}", "Proszę zainicjować diagnostykę PydanticAI."]
        }
