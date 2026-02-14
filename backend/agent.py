import os
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.models.gemini import GeminiModel

load_dotenv()

# Gemini 3 Flash-preview model configuration
GEMINI_MODEL_NAME = "gemini-3-flash-preview"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Create the model instance
# Note: Ensure GEMINI_API_KEY is set in your .env file
model = GeminiModel(GEMINI_MODEL_NAME)

# Define the primary Aether Agent
aether_agent = Agent(
    model=model,
    system_prompt=(
        "Jesteś Aether, proaktywnym i inteligentnym asystentem osobistym. "
        "Twoim celem jest wspieranie użytkownika w codziennych zadaniach, "
        "zarządzanie wiedzą i automatyzacja działań. "
        "Działasz w sposób przemyślany, precyzyjny i proaktywny. "
    ),
    retries=3
)

@aether_agent.tool
async def get_current_time() -> str:
    """Returns the current local time."""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

async def get_agent_response(prompt: str):
    """
    Simple wrapper to get a response from the Aether Agent.
    """
    result = await aether_agent.run(prompt)
    return result.output
