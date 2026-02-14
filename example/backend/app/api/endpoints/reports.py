from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request, Body
from app.supabase_client import supabase
from app.api.deps import get_api_key
from app.services.orchestrator_service import create_debate_from_report

from app.core.limiter import limiter

router = APIRouter()

@router.post("/")
@limiter.limit("5/hour")
async def create_report(request: Request, payload_data: dict = Body(...)):
    """Publiczny endpoint do zgłaszania absurdów. Limit: 5/godzinę per IP."""
    try:
        # Podstawowa walidacja
        if not payload_data.get('title') or not payload_data.get('content'):
            raise HTTPException(status_code=400, detail="Tytuł i treść są wymagane.")
            
        payload = {
            "title": payload_data.get('title'),
            "content": payload_data.get('content'),
            "location": payload_data.get('location'),
            "source_url": payload_data.get('source_url'),
            "category": "uncategorized",
            "status": "pending"
        }
        
        res = supabase.table('reports').insert(payload).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_all_reports(api_key: str = Depends(get_api_key)):
    try:
        res = supabase.table('reports').select('*').order('created_at', desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd bazy: {str(e)}")

@router.delete("/{report_id}")
async def delete_report(report_id: str, api_key: str = Depends(get_api_key)):
    try:
        debate_res = supabase.table('debates').select('id').eq('external_id', report_id).execute()
        if debate_res.data:
            debate_id = debate_res.data[0]['id']
            supabase.table('messages').delete().eq('debate_id', debate_id).execute()
            supabase.table('debates').delete().eq('id', debate_id).execute()
        
        supabase.table('reports').delete().eq('id', report_id).execute()
        return {"status": "deleted", "message": "Raport usunięty"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd bazy: {str(e)}")

@router.post("/{report_id}/process")
async def process_report(
    request: Request,
    report_id: str, 
    background_tasks: BackgroundTasks, 
    api_key: str = Depends(get_api_key),
    use_tavily: bool = False
):
    """Przetwarza raport i uruchamia debatę AI (ręcznie z Admina)."""
    try:
        # create_debate_from_report zwraca coroutine object dla process_debate_stream
        debate_coro = await create_debate_from_report(report_id, use_tavily)
        if not debate_coro:
            raise HTTPException(status_code=404, detail="Raport nie istnieje")
        
        # Funkcja opakowująca do BackgroundTasks
        async def run_analysis():
            try:
                await debate_coro
            except Exception as ex:
                print(f"[BACKGROUND_TASK] Błąd podczas analizy: {ex}")

        background_tasks.add_task(run_analysis)

        return {"status": "initiated", "message": "Analiza uruchomiona w tle."}
    except Exception as e:
        print(f"[REPORTS_API] Błąd: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# === OSOBNY ENDPOINT DO WYWOŁYWANIA SCOUTA (opcjonalny, dla zaawansowanych) ===

@router.post("/{debate_id}/scout")
async def run_scout_for_debate(request: Request, debate_id: str, api_key: str = Depends(get_api_key)):
    """
    Uruchamia wywiad Scouta dla istniejącej debaty.
    Zużywa API Tavily - używaj oszczędnie!
    """
    # Pobierz debatę
    res = supabase.table('debates').select('*').eq('id', debate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Debata nie istnieje")
    
    debate = res.data[0]
    title = debate.get('title', '')
    
    # Uruchom Scout
    print(f"[SCOUT] Ręczny wywiad dla: {title}")
    research = await run_scout_research(title)
    
    # Zapisz wyniki jako wiadomość od Scouta
    msg_payload = {
        "debate_id": debate_id,
        "agent_id": "scout",
        "agent_name": "Scout",
        "role": "AGENT",
        "content": f"📡 RAPORT Z WYWIADU INTERNETOWEGO:\n{research}",
        "message_type": "discovery"
    }
    supabase.table('messages').insert(msg_payload).execute()
    
    return {"status": "success", "message": "Scout zakończył wywiad. Wyniki dodane do debaty."}
