
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models import WebhookPayload, Generation, Slide
from services.openai_service import OpenAIService
from services.kie_service import KieService
from database import db
from datetime import datetime, timezone
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

async def process_generation(generation_id: str, topic: str, count: int, context: str):
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
                background_url=None
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

async def process_ai_viral_generation(generation_id: str, topic: str, count: int):
    """New Nano Banana Pro Flow"""
    openai_service = OpenAIService()
    kie_service = KieService()
    
    try:
        # 1. Generate Content Structure (Headlines + Colors)
        logger.info(f"Generating content for {topic}")
        content = await openai_service.generate_viral_structure(topic, count)
        hero_data = content.get('hero', {})
        body_slides_data = content.get('slides', [])
        
        # 2. Construct Hero Prompt
        # "hero image #0F172A #475569, hero section, centered text: topheadline: "...", bottomheadline: "...", add interesting graphical elements..."
        hero_prompt = (
            f"hero image {hero_data.get('color1', '#000000')} {hero_data.get('color2', '#ffffff')}, "
            f"viral hero section, centered text: "
            f"topheadline: \"{hero_data.get('topheadline')}\", "
            f"bottomheadline: \"{hero_data.get('bottomheadline')}\", "
            f"add interesting graphical elements aluding that there is a next page or to turn the page"
        )
        
        # 3. Generate Hero Image (Nano Banana Pro)
        logger.info("Generating Hero Image...")
        hero_image_url = await kie_service.generate_hero_image(hero_prompt)
        
        if not hero_image_url:
            raise Exception("Failed to generate Hero Image")

        # 4. Generate Clean Background (Nano Banana Edit)
        logger.info("Generating Clean Background...")
        clean_bg_url = await kie_service.remove_text(hero_image_url)
        
        if not clean_bg_url:
            logger.warning("Failed to generate clean background, falling back to hero image")
            clean_bg_url = hero_image_url

        # 5. Assemble Slides
        slides = []
        
        # Slide 1: Hero (Image Only)
        slides.append(Slide(
            title="", # No text overlay
            content="",
            background_prompt=hero_prompt,
            background_url=hero_image_url,
            type="hero",
            layout="default",
            text_bg_enabled=False # Disable text box since text is baked in
        ).model_dump())
        
        # Slide 2..N: Body (Clean BG + Text Overlay)
        for s in body_slides_data:
            slides.append(Slide(
                title=s.get('title', ''),
                content=s.get('content', ''),
                background_prompt="Clean background derived from hero",
                background_url=clean_bg_url, # Use the cleaned image
                type="body",
                layout="default"
            ).model_dump())
            
        # Update DB
        await db.generations.update_one(
            {"id": generation_id},
            {"$set": {"status": "completed", "slides": slides, "updated_at": datetime.now(timezone.utc)}}
        )
        logger.info(f"Viral Generation {generation_id} Complete")

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
    
    # Detect mode based on context or new field (assuming frontend sends context='viral' for now)
    is_viral_mode = payload.extra_context == 'viral'
    
    gen = Generation(topic=payload.topic, slide_count=count, status="processing")
    doc = gen.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    doc['mode'] = 'viral' if is_viral_mode else 'standard'
    
    await db.generations.insert_one(doc)
    
    if is_viral_mode:
        background_tasks.add_task(process_ai_viral_generation, gen.id, payload.topic, count)
    else:
        background_tasks.add_task(
            process_generation, 
            gen.id, 
            payload.topic, 
            count,
            f"{payload.rss_source or ''} {payload.extra_context or ''}"
        )
    
    return {"status": "accepted", "id": gen.id}
