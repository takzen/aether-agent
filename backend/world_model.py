import json
from pydantic_ai import Agent
from local_db import sqlite_service
from agent import model

world_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Aether Active World Model (AWM) module. "
        "Your task is to conduct a silent background simulation (Self-Reflection) based on the latest raw system logs "
        "and recently taken conversations/actions (listed below). "
        "You are not talking to the user. Instead, you map out the project's development direction, pointing out hidden connections "
        "that the user might have missed."
        "\n\nGUIDELINES:\n"
        "1. Look for recurring patterns and blockers.\n"
        "2. Propose one primary INSIGHT for the entire structure based on these logs.\n"
        "3. Propose one suggested ACTION (optimization/fix) that Aether could proactively take.\n\n"
        "Return the response EXACTLY as a JSON object (no Markdown tags, encoding, etc.) with two keys:\n"
        "'insight' (string - your main conclusion)\n"
        "'suggested_action' (string - your proposed optimization action)"
    ),
    retries=3,
    output_type=str
)

async def run_active_world_model_simulation():
    # Fetch the last 30 logs for reflection basis
    logs = await sqlite_service.get_logs(limit=30)
    
    if len(logs) < 5:
        return {
            "insight": "Insufficient telemetry data to run a deep AWM simulation.",
            "suggested_action": "Continue working, gather more informational logs and user inputs."
        }
        
    prompt = "--- INITIATING AWM SIMULATION BASED ON THE FOLLOWING EVENTS ---\n"
    for log in logs:
        prompt += f"[{log['type'].upper()}|{log['source']}] {log['message']}\n"
        
    try:
        result = await world_agent.run(prompt)
        raw_text = result.output.strip()
        
        import re
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)
            
        if not raw_text:
            raise ValueError("Empty response from AWM simulator")
            
        data = json.loads(raw_text)
        
        # Save our AWM insight to the local database
        await sqlite_service.add_log(
            type="awm", 
            source="WORLD_MODEL", 
            message=json.dumps(data)
        )
        
        return data
        
    except Exception as e:
        print(f"[ActiveWorldModel] Background simulation error: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {
            "insight": f"<AWM ERROR> Simulation crashed during logic parsing: {str(e)}",
            "suggested_action": "Awaiting PydanticAI diagnosis to restore background thinking."
        }
