
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
from pathlib import Path
from database import client

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# App
app = FastAPI(title="Social Media Automation API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router
api_router = APIRouter(prefix="/api")

@api_router.get("/health")
async def health():
    return {"status": "ok"}

# Include sub-routers
from routes import webhooks, generations
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(generations.router, prefix="/generations", tags=["generations"])

app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
