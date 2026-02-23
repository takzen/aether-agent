import json
from pydantic_ai import Agent
from local_db import sqlite_service
from agent import model

sleep_agent = Agent(
    model=model,
    system_prompt=(
        "Jesteś modułem Aether NightCycleProcessor. Twoim zadaniem jest konsolidacja logów i wydarzeń z minionego dnia. "
        "Przeanalizuj surowe dane i przygotuj Zwięzły Poranny Raport (Morning Brief). Raport ma mieć charakter technicznego, "
        "krótkiego posumowania z perspektywy fuzji danych. Dołącz 2-3 konkretne punkty (wnioski, ostrzeżenia, propozycje akcji). "
        "Zwróć wynik DOKŁADNIE jako obiekt JSON z kluczami: 'brief' (tekst główny) oraz 'points' (lista stringów). "
        "Nie dodawaj żadnego innego tekstu, tagów takich jak ```json itp. Formatem ma być surowy JSON, a językiem Polski."
    ),
    retries=3,
    output_type=str
)

async def run_sleep_cycle():
    # Pobierz najświeższe logi systemowe
    logs = await sqlite_service.get_logs(limit=50)
    
    if not logs:
        return {
            "brief": "Aether Core zaktualizowany. Brak nowych logów z minionego cyklu. Moduły w stanie spoczynku.",
            "points": ["Systemy bazowe Online.", "Pamięć wektorowa zsynchronizowana."]
        }
        
    prompt = "Przeanalizuj te dane telemetryczne i wygeneruj raport JSON:\n"
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
        
        # Zapisujemy nasz poranny raport w bazie lokalnej jako specjalny log
        await sqlite_service.add_log("brief", "SLEEP_CYCLE", json.dumps(data))
        
        # Zapisz standardowy log info, że cykl się zakończył
        await sqlite_service.add_log("info", "SLEEP_CYCLE", "Zakończono nocną konsolidację grafu i logów.")
        
        return data
        
    except Exception as e:
        print(f"[SleepCycle] Error running night cycle: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {
            "brief": "<ERROR> Aether Core zaktualizowany, lecz proces konsolidacji wektorowej został przerwany przez awarię parsowania.",
            "points": [f"Debug Stack: {str(e)}", "Proszę zainicjować diagnostykę PydanticAI (Model nie zwrócił poprawnego JSON-a)."]
        }
