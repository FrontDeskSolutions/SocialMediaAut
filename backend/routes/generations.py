
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

# ... existing read routes ...
@router.get("/", response_model=List[Generation])
async def list_generations():
    docs = await db.generations.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs

@router.get("/{id}", response_model=Generation)
async def get_generation(id: str):
    doc = await db.generations.find_one({"id": id}, {"_id": 0})
    if not doc: raise HTTPException(status_code=404)
    return doc

@router.put("/{id}")
async def update_generation(id: str, update_data: dict):
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.generations.update_one({"id": id}, {"$set": update_data})
    return {"status": "updated"}

@router.post("/{id}/generate-image/{slide_id}")
async def generate_slide_image(id: str, slide_id: str):
    doc = await db.generations.find_one({"id": id})
    if not doc: raise HTTPException(status_code=404)
    slide = next((s for s in doc['slides'] if s['id'] == slide_id), None)
    
    service = OpenAIService()
    url = await service.generate_image(slide['background_prompt'])
    
    await db.generations.update_one(
        {"id": id, "slides.id": slide_id}, 
        {"$set": {
            "slides.$.background_url": url,
            "slides.$.text_position": "middle_center", 
            "slides.$.container_opacity": 0.6
        }}
    )
    return {"url": url}

async def process_viral_visuals(generation_id: str):
    kie_service = KieService()
    openai_service = OpenAIService()
    
    try:
        doc = await db.generations.find_one({"id": generation_id})
        if not doc: return
        slides = doc.get('slides', [])
        if not slides: return

        hero_slide = slides[0]
        
        logger.info(f"Generating Viral Hero for {generation_id}")
        hero_url = await kie_service.generate_hero_image(hero_slide['background_prompt'])
        
        clean_url = None
        design_rec = {}
        
        if hero_url:
            logger.info(f"Generating Clean BG for {generation_id}")
            clean_url = await kie_service.remove_text(hero_url)
            if not clean_url:
                clean_url = hero_url 

            logger.info(f"Analyzing Background for Design Recommendations...")
            design_rec = await openai_service.analyze_design_from_image(clean_url)
            logger.info(f"Design Recs: {design_rec}")

        if hero_url:
            # Update Hero
            slides[0]['background_url'] = hero_url
            
            # Update Body Slides
            for i in range(1, len(slides)):
                slides[i]['background_url'] = clean_url
                if clean_url and design_rec:
                    slides[i]['headline_color'] = design_rec.get('headline_color') # UPDATED
                    slides[i]['font_color'] = design_rec.get('font_color') # UPDATED
                    slides[i]['font'] = design_rec.get('font', 'modern')
                    slides[i]['text_position'] = design_rec.get('text_position', 'middle_center')
                    slides[i]['text_align'] = design_rec.get('text_align', 'center')
                    slides[i]['container_opacity'] = design_rec.get('containerOpacity', 0.6)
                    slides[i]['text_shadow'] = design_rec.get('textShadow', True)
                    slides[i]['text_width'] = design_rec.get('text_width', 'medium')

            await db.generations.update_one(
                {"id": generation_id},
                {"$set": {"slides": slides, "updated_at": datetime.now(timezone.utc)}}
            )

    except Exception as e:
        logger.error(f"Viral Visuals Failed: {e}")

@router.post("/{id}/generate-viral-visuals")
async def trigger_viral_visuals(id: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_viral_visuals, id)
    return {"status": "accepted"}
