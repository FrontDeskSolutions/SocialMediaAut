
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'app_db')]

# App
app = FastAPI(title="Social Media Automation API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"], # Open for now, restrict in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router
api_router = APIRouter(prefix="/api")

@api_router.get("/health")
async def health():
    return {"status": "ok"}

# Include sub-routers
from app.routes import webhooks, generations
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(generations.router, prefix="/generations", tags=["generations"])

app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
