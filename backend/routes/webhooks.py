
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models import WebhookPayload, Generation, Slide, THEME_COLORS
from services.openai_service import OpenAIService
from services.kie_service import KieService
from database import db
from datetime import datetime, timezone
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# ... process_generation (Standard) ...
async def process_generation(generation_id: str, topic: str, count: int, context: str, theme: str):
    service = OpenAIService()
    try:
        slides_data = await service.generate_slides_content(topic, count, context)
        slides = []
        for s in slides_data:
            slides.append(Slide(
                title=s.get('title', ''),
                content=s.get('content', ''),
                background_prompt=s.get('background_prompt', 'Abstract minimal background'),
                type=s.get('type', 'body'),
                theme=theme
            ).model_dump())

        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "draft", "slides": slides, "updated_at": datetime.now(timezone.utc)}}
        )
    except Exception as e:
        logger.error(f"Standard Processing failed: {e}")
        await db.generations.update_one({"id": generation_id}, {"$set": {"status": "failed"}})

async def process_ai_viral_generation(generation_id: str, topic: str, count: int, theme: str):
    """New Nano Banana Pro Flow - Text Phase"""
    openai_service = OpenAIService()
    
    try:
        # 1. Generate Content
        content = await openai_service.generate_viral_structure(topic, count)
        hero_data = content.get('hero', {})
        body_slides_data = content.get('slides', [])
        
        # Get theme color
        theme_data = THEME_COLORS.get(theme, THEME_COLORS['trust_clarity'])
        bg_color = theme_data['c1'] # Use primary color as background base
        
        # 2. Construct Specific Hero Prompt
        # "{color} background\n\nYou are an expert-level alex hormozi style designer..."
        hero_prompt = (
            f"{bg_color} background\n\n"
            f"You are an expert-level alex hormozi style designer.\n\n"
            f"Based on principles of marketing, automatically choose the most perfect composition. "
            f"The overall mood should feel immersive, captivating, interesting\n\n"
            f"Choose the most stylish stylized font for this\n\n"
            f"centered text: topheadline: \"{hero_data.get('topheadline')}\", \n\n"
            f"bottomheadline: \"{hero_data.get('bottomheadline')}\", \n\n"
        )
        
        # 3. Assemble Slides
        slides = []
        
        # Slide 1: Hero
        slides.append(Slide(
            title="", 
            content="",
            background_prompt=hero_prompt,
            type="hero",
            theme=theme,
            text_bg_enabled=False
        ).model_dump())
        
        # Slide 2..N: Body
        for s in body_slides_data:
            slides.append(Slide(
                title=s.get('title', ''),
                content=s.get('content', ''),
                background_prompt="Clean background derived from hero",
                type="body",
                theme=theme
            ).model_dump())
            
        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "draft", "slides": slides, "updated_at": datetime.now(timezone.utc)}}
        )

    except Exception as e:
        logger.error(f"Viral Text Phase Failed: {e}")
        await db.generations.update_one({"id": generation_id}, {"$set": {"status": "failed"}})

@router.post("/trigger")
async def trigger_generation(payload: WebhookPayload, background_tasks: BackgroundTasks):
    count = payload.slide_count if payload.slide_count > 0 else 5
    is_viral_mode = payload.extra_context == 'viral'
    
    gen = Generation(
        topic=payload.topic, 
        slide_count=count, 
        status="processing", 
        mode='viral' if is_viral_mode else 'standard',
        theme=payload.theme
    )
    doc = gen.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.generations.insert_one(doc)
    
    if is_viral_mode:
        background_tasks.add_task(process_ai_viral_generation, gen.id, payload.topic, count, payload.theme)
    else:
        background_tasks.add_task(process_generation, gen.id, payload.topic, count, "", payload.theme)
    
    return {"status": "accepted", "id": gen.id}
