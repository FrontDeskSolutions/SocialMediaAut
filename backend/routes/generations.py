
from fastapi import APIRouter, HTTPException, Depends
from models import Generation, Slide
from database import db
from services.openai_service import OpenAIService
from typing import List
from datetime import datetime, timezone

router = APIRouter()

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
    # Minimal validation for now, trusting frontend
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
        
        # Update specific slide
        await db.generations.update_one(
            {"id": id, "slides.id": slide_id},
            {"$set": {"slides.$.background_url": url}}
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
