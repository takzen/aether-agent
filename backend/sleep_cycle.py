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
    # 1. Fetch checkpoint (last processed log ID)
    checkpoint_id = await sqlite_service.get_checkpoint("sleep_cycle")
    
    # 2. Fetch the newest system logs since the checkpoint
    logs = await sqlite_service.get_logs(limit=100, from_id=checkpoint_id)
    
    if not logs:
        conf = get_config()
        lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
        if lang == "en":
            return {
                "brief": "Aether Core updated. No new telemetry since the last cycle. Systems stable.",
                "points": ["No fresh events detected.", "Checkpoint synchronization active."]
            }
        else:
            return {
                "brief": "Rdzeń Aether zaktualizowany. Brak nowej telemetrii od ostatniego cyklu. Systemy stabilne.",
                "points": ["Nie wykryto nowych zdarzeń.", "Synchronizacja punktów kontrolnych aktywna."]
            }
        
    prompt = "Analyze this NEW telemetry data since the last report and generate a JSON report:\n"
    max_log_id = checkpoint_id
    for log in logs:
        prompt += f"[{log['type'].upper()}|{log['source']}] {log['message']}\n"
        # Track the highest log ID we've seen in this batch
        if log['id'] > max_log_id:
            max_log_id = log['id']
        
    try:
        result = await sleep_agent.run(prompt)
        data = result.output.model_dump()
        
        # 3. Save report and UPDATE CHECKPOINT
        await sqlite_service.add_log("brief", "SLEEP_CYCLE", json.dumps(data))
        await sqlite_service.set_checkpoint("sleep_cycle", max_log_id)
        await sqlite_service.add_log("info", "SLEEP_CYCLE", f"Consolidated {len(logs)} events up to ID {max_log_id}.")
        
        return data
        
    except Exception as e:
        print(f"[SleepCycle] Error running night cycle: {repr(e)}")
        return {
            "brief": "Aether Core zaktualizowany, lecz proces konsolidacji wektorowej został przerwany przez awarię parsowania.",
            "points": [f"Debug: {str(e)}", "Wymagana weryfikacja schematu PydanticAI."]
        }
