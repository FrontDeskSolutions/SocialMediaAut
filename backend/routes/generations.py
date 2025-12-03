
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models import Generation, Slide
from database import db
from services.openai_service import OpenAIService
from services.kie_service import KieService
from typing import List
from datetime import datetime, timezone
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[Generation])
async def list_generations():
    docs = await db.generations.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs

@router.get("/{id}", response_model=Generation)
async def get_generation(id: str):
    doc = await db.generations.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Generation not found")
    return doc

@router.put("/{id}")
async def update_generation(id: str, update_data: dict):
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.generations.update_one({"id": id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Generation not found")
    return {"status": "updated"}

@router.post("/{id}/generate-image/{slide_id}")
async def generate_slide_image(id: str, slide_id: str):
    doc = await db.generations.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    slide = next((s for s in doc['slides'] if s['id'] == slide_id), None)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
        
    service = OpenAIService()
    try:
        url = await service.generate_image(slide['background_prompt'])
        await db.generations.update_one(
            {"id": id, "slides.id": slide_id},
            {"$set": {"slides.$.background_url": url}}
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_viral_visuals(generation_id: str):
    """Background task for generating viral assets"""
    kie_service = KieService()
    try:
        doc = await db.generations.find_one({"id": generation_id})
        if not doc:
            return

        slides = doc.get('slides', [])
        if not slides:
            return

        hero_slide = slides[0]
        if hero_slide['type'] != 'hero':
            logger.error("First slide is not hero")
            return

        # 1. Generate Hero Image
        logger.info(f"Generating Viral Hero for {generation_id}")
        hero_url = await kie_service.generate_hero_image(hero_slide['background_prompt'])
        
        # 2. Generate Background
        clean_url = None
        if hero_url:
            logger.info(f"Generating Clean BG for {generation_id}")
            clean_url = await kie_service.remove_text(hero_url)
            if not clean_url:
                clean_url = hero_url # Fallback

        # 3. Update Slides
        if hero_url:
            slides[0]['background_url'] = hero_url
            
            # Update all body/cta slides with clean bg
            for i in range(1, len(slides)):
                slides[i]['background_url'] = clean_url

            await db.generations.update_one(
                {"id": generation_id},
                {"$set": {"slides": slides, "updated_at": datetime.now(timezone.utc)}}
            )
            logger.info(f"Viral Visuals Complete for {generation_id}")

    except Exception as e:
        logger.error(f"Viral Visuals Failed: {e}")

@router.post("/{id}/generate-viral-visuals")
async def trigger_viral_visuals(id: str, background_tasks: BackgroundTasks):
    """Trigger the expensive visual generation manually"""
    doc = await db.generations.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Generation not found")
        
    background_tasks.add_task(process_viral_visuals, id)
    return {"status": "accepted"}
