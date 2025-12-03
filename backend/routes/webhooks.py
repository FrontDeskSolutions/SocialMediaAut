
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

async def process_generation(generation_id: str, topic: str, count: int, context: str, theme: str):
    """Standard GPT-4o + DALL-E flow"""
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
                background_url=None,
                theme=theme
            ).model_dump())

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

async def process_ai_viral_generation(generation_id: str, topic: str, count: int, theme: str):
    """New Nano Banana Pro Flow - Text Phase Only"""
    openai_service = OpenAIService()
    
    try:
        # 1. Generate Content Structure
        logger.info(f"Generating viral content for {topic}")
        content = await openai_service.generate_viral_structure(topic, count)
        hero_data = content.get('hero', {})
        body_slides_data = content.get('slides', [])
        
        # Get colors from the SELECTED THEME
        theme_data = THEME_COLORS.get(theme, THEME_COLORS['trust_clarity'])
        color1 = theme_data['c1']
        color2 = theme_data['c2']
        
        # 2. Construct Hero Prompt (Stored for later use)
        hero_prompt = (
            f"hero image {color1} {color2}, "
            f"viral hero section, centered text: "
            f"topheadline: \"{hero_data.get('topheadline')}\", "
            f"bottomheadline: \"{hero_data.get('bottomheadline')}\", "
            f"add interesting graphical elements aluding that there is a next page"
        )
        
        # 3. Assemble Slides (Status: Draft, No Images Yet)
        slides = []
        
        # Slide 1: Hero
        slides.append(Slide(
            title="", # Hero image handles text
            content="",
            background_prompt=hero_prompt,
            background_url=None,
            type="hero",
            layout="default",
            theme=theme,
            text_bg_enabled=False 
        ).model_dump())
        
        # Slide 2..N: Body
        for s in body_slides_data:
            slides.append(Slide(
                title=s.get('title', ''),
                content=s.get('content', ''),
                background_prompt="Clean background derived from hero",
                background_url=None,
                type="body",
                layout="default",
                theme=theme
            ).model_dump())
            
        # Update DB - Ready for visual generation
        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "draft", "slides": slides, "updated_at": datetime.now(timezone.utc)}}
        )
        logger.info(f"Viral Text Generation {generation_id} Complete")

    except Exception as e:
        logger.error(f"Viral Processing failed for {generation_id}: {e}")
        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc)}}
        )

@router.post("/trigger")
async def trigger_generation(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """Endpoint for n8n to trigger a generation"""
    count = payload.slide_count if payload.slide_count and payload.slide_count > 0 else 5
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
        background_tasks.add_task(
            process_generation, 
            gen.id, 
            payload.topic, 
            count,
            f"{payload.rss_source or ''} {payload.extra_context or ''}",
            payload.theme
        )
    
    return {"status": "accepted", "id": gen.id}
