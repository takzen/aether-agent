
import os
from app.supabase_client import supabase
from app.agents.scout import tavily_search, scout_agent, TopicDiscovery
from app.services.settings import update_last_run

async def execute_scout_mission() -> dict:
    """
    Wykonuje pełną misję Scouta:
    1. Przeszukuje sieć (Tavily).
    2. Analizuje wyniki (Gemini).
    3. Zapisuje raport w Supabase.
    """
    try:
        update_last_run("running")
        
        # Wyszukaj aktualne polskie absurdy biurokracyjne w rzetelnych źródłach
        search_queries = [
            "site:portalsamorzadowy.pl OR site:gazetaprawna.pl OR site:rp.pl OR site:money.pl biurokracja absurd urząd 2026",
            "site:interwencja.polsatnews.pl OR site:uwaga.tvn.pl urzędnik problem skarga",
            "nowe przepisy biurokratyczne Polska 2026 -site:waweldom.pl -site:olx.pl"
        ]
        
        all_findings = []
        
        # Rotujemy zapytaniami, żeby co rano był inny temat
        import random
        query_to_use = random.choice(search_queries)
        results = await tavily_search(query_to_use)
        for r in results:
            if r.url and "[BRAK" not in r.title:  # Tylko prawdziwe wyniki
                all_findings.append({
                    "title": r.title,
                    "url": r.url,
                    "content": r.content[:300]
                })
        
        if not all_findings:
            update_last_run("empty")
            return {
                "status": "empty",
                "message": "Brak nowych sygnałów w sieci.",
                "findings": 0
            }

        # Zredaguj raport przez Agenta AI
        findings_text = "\n".join([f"Tytuł: {f['title']}\nTreść: {f['content']}\nURL: {f['url']}" for f in all_findings])
        
        scout_ai_prompt = (
            f"Przeanalizuj poniższe znaleziska z sieci i wygeneruj profesjonalny Raport Scouta (TopicDiscovery).\n"
            f"1. Nadaj mu krótki, techniczny i sensowny tytuł w języku polskim (np. 'Awaria systemu ePUAP', 'Absurd drogowy').\n"
            f"2. Zredaguj treść opisu, skupiając się na esencji problemu.\n"
            f"3. Zachowaj styl wojskowy/cyberpunkowy.\n\n"
            f"DANE Z SIECI:\n{findings_text}"
        )
        
        result = await scout_agent.run(scout_ai_prompt, output_type=TopicDiscovery)
        discovery = result.output

        scout_report = {
            "title": f"[SCOUT] {discovery.title}",
            "content": discovery.description,
            "source_url": discovery.source_url or all_findings[0]['url'],
            "location": "INTERNET",
            "status": "pending"
        }
        
        # Zapisz w bazie
        supabase.table('reports').insert(scout_report).execute()
        
        update_last_run("success")
        return {
            "status": "success", 
            "message": f"Znaleziono {len(all_findings)} źródeł. Raport dodany do kolejki.",
            "findings": len(all_findings),
            "title": discovery.title
        }
            
    except Exception as e:
        error_msg = str(e)
        update_last_run(f"error: {error_msg}")
        print(f"[SCOUT SERVICE] Error: {error_msg}")
        return {
            "status": "error",
            "message": f"Błąd misji: {error_msg}",
            "findings": 0
        }
