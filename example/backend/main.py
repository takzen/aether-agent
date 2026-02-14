from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import asyncio
from contextlib import asynccontextmanager
from app.api.api import api_router
from worker import main_loop
import logfire

# Konfiguracja Logfire
logfire.configure(
    pydantic_plugin=logfire.PydanticPlugin(record='all'),
    send_to_logfire=os.environ.get("LOGFIRE_TOKEN") is not None
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start autonomous worker in the background
    worker_task = asyncio.create_task(main_loop())
    print("🚀 SYSTEM_START: Autonomiczny worker zainicjalizowany w tle.")
    yield
    # Cleanup if needed
    worker_task.cancel()

from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(title="Bieg Wsteczny API", lifespan=lifespan)
logfire.instrument_fastapi(app)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Bardzo liberalny CORS dla developmentu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "DELETE", "PUT"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Bieg Wsteczny API active"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # Włączamy reload dla wygody podczas developmentu
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
