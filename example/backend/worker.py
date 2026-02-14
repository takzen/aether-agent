import asyncio
import os
import sys
from datetime import datetime, time
from dotenv import load_dotenv

# Dodaj katalog główny do path, aby importy działały
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.services.settings import get_settings, update_last_run
from app.services.orchestrator_service import create_debate_from_report
from app.supabase_client import supabase

async def run_mission():
    """Symuluje wywołanie endpointu /mission (Scout Mission)."""
    print(f"[{datetime.now()}] WORKER: Rozpoczynam misję Scouta...")
    try:
        # Importujemy tutaj, żeby uniknąć problemów z cyklicznymi importami
        from app.api.endpoints.scout import scout_mission
        # Ponieważ scout_mission to endpoint FastAPI, wywołamy bezpośrednio logikę
        # Dla uproszczenia powtórzę tutaj szkielet wywołania lub zaimportuję funkcję search
        
        # Właściwie najprościej będzie zaimportować funkcję i ją wywołać
        # Ale scout_mission zależy od get_api_key (Depends)
        # Więc wywołamy ją bez zabezpieczeń (to i tak skrypt lokalny)
        
        # Aby nie duplikować kodu, udajemy wywołanie misji
        # W przyszłości warto wydzielić logikę misji do scout_service.py
        pass
    except Exception as e:
        print(f"WORKER ERROR: {e}")

async def auto_process_reports():
    """Automatycznie zatwierdza pending raporty od Scouta."""
    print(f"[{datetime.now()}] WORKER: Rozpoczynam auto-procesowanie raportów...")
    try:
        # Pobierz raporty [SCOUT] które są pending
        res = supabase.table('reports').select('id').eq('status', 'pending').filter('title', 'ilike', '%[SCOUT]%').execute()
        reports = res.data or []
        
        print(f"WORKER: Znaleziono {len(reports)} raportów do przetworzenia.")
        
        for r in reports:
            print(f"WORKER: Przetwarzam raport {r['id']}...")
            debate_task = await create_debate_from_report(r['id'], use_tavily=False) # Scout już zrobił research
            if debate_task:
                await debate_task
                print(f"WORKER: Raport {r['id']} przetworzony pomyślnie.")
    except Exception as e:
        print(f"WORKER ERROR (auto_process): {e}")

async def main_loop():
    print("=== BIEG WSTECZNY: AUTONOMOUS WORKER STARTED ===")
    
    while True:
        try:
            settings = get_settings()
            
            if not settings.get("worker_enabled"):
                print(f"[{datetime.now()}] WORKER: System wyłączony w ustawieniach (Supabase). Czekam 60s...")
                await asyncio.sleep(60)
                continue
                
            now = datetime.now()
            # Cel: 06:00
            target_time = time(6, 0)
            
            last_run_val = settings.get("last_run")
            should_run = False
            
            if last_run_val:
                # Obsługa zarówno stringa jak i obiektu datetime (Supabase client może różnie zwracać)
                if isinstance(last_run_val, str):
                    last_run_date = datetime.fromisoformat(last_run_val.replace('Z', '+00:00')).date()
                else:
                    last_run_date = last_run_val.date()
                
                if last_run_date < now.date() and now.time() >= target_time:
                    should_run = True
            else:
                if now.time() >= target_time:
                    should_run = True
                    
            if should_run:
                print(f"[{now}] WORKER: CZAS NA AUTOMATYCZNĄ MISJĘ!")
                
                # 1. NAJPIERW: Wyślij Scouta w internet (Tavily), żeby znalazł nowe tematy
                from app.services.scout_service import execute_scout_mission
                scout_result = await execute_scout_mission()
                print(f"WORKER: Misja Scouta zakończona: {scout_result.get('message')}")
                
                # 2. POTEM: Przetwórz to, co Scout znalazł (zamień raporty w debaty)
                await auto_process_reports()
                
                # Aktualizujemy czas ostatniego uruchomienia
                update_last_run("success (auto)")
            
        except Exception as e:
            print(f"WORKER LOOP ERROR: {e}")
        
        await asyncio.sleep(60) # Sprawdzaj co minutę

if __name__ == "__main__":
    asyncio.run(main_loop())
