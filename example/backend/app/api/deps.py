import os
from fastapi import HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader

API_KEY_NAME = "X-API-KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

async def get_api_key(api_key: str = Depends(api_key_header)):
    expected_key = os.environ.get("ADMIN_API_KEY", "ANTIGRAVITY")
    if api_key != expected_key:
        raise HTTPException(status_code=403, detail="Błędny klucz API")
    return api_key
