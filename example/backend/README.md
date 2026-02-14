# Bieg Wsteczny - Backend

Silnik diagnostyczny portalu BiegWsteczny.pl oparty na **PydanticAI** i modelach **Google Gemini**.

## Struktura projektu
- `/app/agents`: Definicje autonomicznych agentów (Scout, Legalist, etc.).
- `/app/models`: Modele danych Pydantic dla debat i wiadomości.
- `main.py`: Entrypoint FastAPI.

## Technologie
- **PydanticAI**: Wykorzystywany do orkiestracji agentów i type-safe LLM outputs.
- **Google Gemini 3.0 Flash**: Główny model językowy.
- **FastAPI**: Serwer API dla frontendu.

## Konfiguracja
1. Skopiuj `.env.example` do `.env`.
2. Wpisz swój `GOOGLE_API_KEY`.
3. Uruchom przez `uv run uvicorn main:app --reload`.
