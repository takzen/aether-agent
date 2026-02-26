import json
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from local_db import sqlite_service
from agent import model

class WorldInsight(BaseModel):
    insight: str = Field(description="Main conclusion about the project development direction based on telemetry.")
    suggested_action: str = Field(description="Proposed optimization or proactive fix action for Aether.")

world_agent = Agent(
    model=model,
    system_prompt=(
        "You are the Aether Active World Model (AWM) module. "
        "Your task is to conduct a silent background simulation (Self-Reflection) based on the latest raw system logs. "
        "Analyze the logs for patterns, blockers, and hidden connections."
    ),
    retries=3,
    output_type=WorldInsight
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
        
        # Agent returns a validated Pydantic object (WorldInsight)
        data = result.output.model_dump()
        
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
