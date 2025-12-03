
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models import WebhookPayload, Generation, Slide
from services.openai_service import OpenAIService
from database import db
from datetime import datetime, timezone
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

async def process_generation(generation_id: str, topic: str, count: int, context: str):
    service = OpenAIService()
    try:
        # 1. Generate Content
        slides_data = await service.generate_slides_content(topic, count, context)
        
        slides = []
        for s in slides_data:
            slides.append(Slide(
                title=s.get('title', ''),
                content=s.get('content', ''),
                background_prompt=s.get('background_prompt', 'Abstract minimal background'),
                type=s.get('type', 'body'),
                background_url=None
            ).model_dump())

        # 2. Update DB with content
        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "draft", "slides": slides, "updated_at": datetime.now(timezone.utc)}}
        )
        
    except Exception as e:
        logger.error(f"Processing failed for {generation_id}: {e}")
        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc)}}
        )

@router.post("/trigger")
async def trigger_generation(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """Endpoint for n8n to trigger a generation"""
    
    # Default to 5 if not specified
    count = payload.slide_count if payload.slide_count and payload.slide_count > 0 else 5
    
    gen = Generation(topic=payload.topic, slide_count=count, status="processing")
    doc = gen.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.generations.insert_one(doc)
    
    # Start processing in background
    background_tasks.add_task(
        process_generation, 
        gen.id, 
        payload.topic, 
        count,
        f"{payload.rss_source or ''} {payload.extra_context or ''}"
    )
    
    return {"status": "accepted", "id": gen.id}
