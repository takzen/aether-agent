import os
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.models.gemini import GeminiModel

load_dotenv()

# Skonfigurowany model Gemini
# Używamy modelu wskazanego przez użytkownika
GEMINI_MODEL_NAME = "gemini-3-flash-preview" 
model = GeminiModel(GEMINI_MODEL_NAME)

def create_bare_agent(system_prompt: str) -> Agent:
    """Tworzy bazowego agenta z zadanym promptem systemowym."""
    return Agent(
        model=model,
        system_prompt=system_prompt,
        retries=3
    )
