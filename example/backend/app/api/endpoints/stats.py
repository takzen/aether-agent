from fastapi import APIRouter, HTTPException, Request
from app.supabase_client import supabase
from app.core.limiter import limiter

router = APIRouter()

@router.get("/")
@limiter.limit("30/minute")
async def get_global_stats(request: Request):
    """Pobiera globalne statystyki systemu Bieg Wsteczny."""
    try:
        # 1. Liczba wszystkich debat
        debates_res = supabase.table('debates').select('id', count='exact').execute()
        total_debates = debates_res.count if debates_res.count is not None else 0

        # 2. Liczba wszystkich raportów (oczekujących i przetworzonych)
        reports_res = supabase.table('reports').select('id', count='exact').execute()
        total_reports = reports_res.count if reports_res.count is not None else 0

        # 3. Pobierz confirmations i absurd_score do obliczeń
        debates_data_res = supabase.table('debates').select('confirmations, absurd_score').execute()
        total_confirmations = sum(d.get('confirmations', 0) for d in debates_data_res.data) if debates_data_res.data else 0

        # 4. Średni Absurd Score
        scores = [d.get('absurd_score', 0) for d in debates_data_res.data] if debates_data_res.data else []
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0

        # 5. Aktywność agentów (liczba wiadomości)
        messages_res = supabase.table('messages').select('agent_id', count='exact').execute()
        total_messages = messages_res.count if messages_res.count is not None else 0

        return {
            "total_debates": total_debates,
            "total_reports": total_reports,
            "total_confirmations": total_confirmations,
            "average_absurd_score": avg_score,
            "total_messages": total_messages,
            "system_status": "OPERATIONAL",
            "redundancy_level": "99.8%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas pobierania statystyk: {str(e)}")
