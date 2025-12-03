
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/image")
async def proxy_image(url: str):
    """
    Proxy external images to avoid CORS issues in frontend (html-to-image)
    """
    if not url:
        raise HTTPException(status_code=400, detail="URL required")
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, follow_redirects=True, timeout=10.0)
            resp.raise_for_status()
            
            return Response(
                content=resp.content, 
                media_type=resp.headers.get("content-type", "image/png"),
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "public, max-age=3600"
                }
            )
    except Exception as e:
        logger.error(f"Proxy error for {url}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch image")
