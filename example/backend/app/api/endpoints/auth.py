import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class AuthPayload(BaseModel):
    code: str

@router.post("/verify")
async def verify_admin(payload: AuthPayload):
    expected_key = os.environ.get("ADMIN_API_KEY", "ANTIGRAVITY")
    if payload.code == expected_key:
        return {"status": "success", "message": "Sygnatura zweryfikowana"}
    raise HTTPException(status_code=403, detail="Błędna sygnatura neuralna")
