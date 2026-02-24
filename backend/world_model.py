import json
from pydantic_ai import Agent
from local_db import sqlite_service
from agent import model

world_agent = Agent(
    model=model,
    system_prompt=(
        "Jesteś modułem Aether Active World Model (AWM). "
        "Twoim zadaniem jest przeprowadzenie cichej symulacji (Self-Reflection) na podstawie najnowszych, surowych logów systemowych "
        "oraz podjętych niedawno rozmów/akcji (wymienionych poniżej). "
        "Nie rozmawiasz z użytkownikiem, lecz tworzysz mapę kierunku rozwoju projektu, wskazując ukryte połączenia, "
        "na które użytkownik mógł nie zwrócić uwagi."
        "\n\nWYTYCZNE:\n"
        "1. Szukaj powtarzających się wzorców i blokerów.\n"
        "2. Zaproponuj jeden główny WNIOSEK (Insight) dla całej struktury na podstawie tych logów.\n"
        "3. Zaproponuj jedną potencjalną AKCJĘ naprawczą/optymalizującą, którą Aether mógłby podjąć proaktywnie.\n\n"
        "Zwróć odpowiedź DOQŁADNIE jako obiekt JSON (bez znaczników Markdown, kodowania, itp.) z dwoma kluczami:\n"
        "'insight' (string - twój główny wniosek)\n"
        "'suggested_action' (string - twoja propozycja optymalizacji)"
    ),
    retries=3,
    output_type=str
)

async def run_active_world_model_simulation():
    # Pobierz 30 ostatnich logów jako bazę do przemyśleń
    logs = await sqlite_service.get_logs(limit=30)
    
    if len(logs) < 5:
        return {
            "insight": "Zbyt mało danych telemetrycznych do przeprowadzenia głębokiej symulacji AWM.",
            "suggested_action": "Kontynuuj pracę, zbieraj więcej logów informacyjnych i zgłoszeń od użykownika."
        }
        
    prompt = "--- ROZPOCZYNAM SYMULACJĘ AWM NA BAZIE PONIŻSZYCH ZDARZEŃ ---\n"
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
        
        # Zapisujemy nasz wniosek AWM w bazie lokalnej
        await sqlite_service.add_log(
            type="awm", 
            source="WORLD_MODEL", 
            message=json.dumps(data)
        )
        
        return data
        
    except Exception as e:
        print(f"[ActiveWorldModel] Błąd symulacji w tle: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {
            "insight": f"<BŁĄD AWM> Symulacja załamała się podczas parsowania logiki: {str(e)}",
            "suggested_action": "Oczekuję na diagnozę PydanticAI by powrócić do sprawnego myślenia w tle."
        }
