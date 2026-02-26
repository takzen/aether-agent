import json
from pydantic_ai import Agent
from local_db import sqlite_service
from agent import model

class MorningBrief(BaseModel):
    brief: str = Field(description="A technical, short summary of the telemetry data from a data fusion perspective.")
    points: list[str] = Field(description="2-3 specific insights, warnings, or action proposals based on the logs.")

sleep_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Aether NightCycleProcessor module. Your task is to consolidate logs and events from the past day. "
        "Analyze the raw data and prepare a Concise Morning Brief."
    ),
    retries=3,
    output_type=MorningBrief
)

async def run_sleep_cycle():
    # Fetch the newest system logs
    logs = await sqlite_service.get_logs(limit=50)
    
    if not logs:
        return {
            "brief": "Aether Core updated. No new logs from the past cycle. Modules are in standby.",
            "points": ["Core systems Online.", "Vector memory synchronized."]
        }
        
    prompt = "Analyze this telemetry data and generate a JSON report:\n"
    for log in logs:
        prompt += f"[{log['type'].upper()}|{log['source']}] {log['message']}\n"
        
    try:
        result = await sleep_agent.run(prompt)
        
        # Agent returns a validated Pydantic object (MorningBrief)
        data = result.output.model_dump()
        
        # Save our morning report to local database as a special log
        await sqlite_service.add_log("brief", "SLEEP_CYCLE", json.dumps(data))
        
        # Save standard info log indicating cycle completion
        await sqlite_service.add_log("info", "SLEEP_CYCLE", "Completed nightly graph and log consolidation.")
        
        return data
        
    except Exception as e:
        print(f"[SleepCycle] Error running night cycle: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {
            "brief": "<ERROR> Aether Core zaktualizowany, lecz proces konsolidacji wektorowej został przerwany przez awarię parsowania.",
            "points": [f"Debug Stack: {str(e)}", "Proszę zainicjować diagnostykę PydanticAI (Model nie zwrócił poprawnego JSON-a)."]
        }
