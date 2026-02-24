import json
from pydantic_ai import Agent
from local_db import sqlite_service
from agent import model

sleep_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Aether NightCycleProcessor module. Your task is to consolidate logs and events from the past day. "
        "Analyze the raw data and prepare a Concise Morning Brief. The report should be a technical, "
        "short summary from a data fusion perspective. Include 2-3 specific points (insights, warnings, action proposals). "
        "Return the result EXACTLY as a JSON object with keys: 'brief' (main text) and 'points' (list of strings). "
        "Do not add any other text, tags such as ```json etc. The format must be raw JSON, and the language English."
    ),
    retries=3,
    output_type=str
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
        
        raw_text = result.output.strip()
        
        import re
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)
            
        if not raw_text:
            raise ValueError(f"Model returned empty string. Raw output was: {result.output}")
            
        data = json.loads(raw_text)
        
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
