from fastapi import APIRouter
from app.api.endpoints import reports, tags, auth, scout, social, stats

api_router = APIRouter()
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(scout.router, prefix="/scout", tags=["scout"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
