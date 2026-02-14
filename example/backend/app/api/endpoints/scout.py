from fastapi import APIRouter, Depends, Body, Request
from app.api.deps import get_api_key
from app.supabase_client import supabase
from app.agents.scout import tavily_search
from app.services.settings import get_settings, update_last_run, toggle_worker

from app.core.limiter import limiter
router = APIRouter()

@router.post("/mission")
async def scout_mission(request: Request, api_key: str = Depends(get_api_key)):
    """
    Uruchamia globalną misję wywiadowczą Scouta.
    Przeszukuje internet w poszukiwaniu aktualnych absurdów.
    """
    from app.services.scout_service import execute_scout_mission
    return await execute_scout_mission()


@router.get("/status")
async def scout_status(api_key: str = Depends(get_api_key)):
    """Sprawdza status Scouta i ostatnie wyniki."""
    settings = get_settings()
    return {
        "status": "ready",
        "tavily_configured": True,
        "last_mission": settings.get("last_run"),
        "last_status": settings.get("last_run_status"),
        "worker_enabled": settings.get("worker_enabled"),
        "cron_schedule": settings.get("cron_schedule")
    }

@router.post("/toggle-worker")
async def scout_toggle_worker(enabled: bool = Body(..., embed=True), api_key: str = Depends(get_api_key)):
    """Włącza/wyłącza automatycznego workera."""
    toggle_worker(enabled)
    return {"status": "success", "worker_enabled": enabled}
