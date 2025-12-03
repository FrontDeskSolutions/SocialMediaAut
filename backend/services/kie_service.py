
import httpx
import asyncio
import json
import logging
import os
from tenacity import retry, stop_after_attempt, wait_fixed

logger = logging.getLogger(__name__)

class KieService:
    def __init__(self):
        self.api_key = os.environ.get("KIE_AI_API_KEY")
        self.base_url = "https://api.kie.ai"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    async def create_task(self, model: str, input_data: dict) -> str:
        url = f"{self.base_url}/api/v1/jobs/createTask"
        payload = {
            "model": model,
            "input": input_data
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=self.headers, timeout=30.0)
            if resp.status_code != 200:
                logger.error(f"Kie Create Failed: {resp.text}")
                raise Exception(f"Kie Create Failed: {resp.status_code}")
            
            data = resp.json()
            return data.get('data', {}).get('taskId')

    @retry(stop=stop_after_attempt(30), wait=wait_fixed(5))
    async def poll_task(self, task_id: str) -> str:
        url = f"{self.base_url}/api/v1/jobs/recordInfo"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params={"taskId": task_id}, headers=self.headers, timeout=30.0)
            if resp.status_code != 200:
                logger.warning(f"Kie Poll Error: {resp.status_code}")
                raise Exception("Poll failed")
            
            data = resp.json().get('data', {})
            state = data.get('state')
            
            if state == 'success':
                result_json = data.get('resultJson')
                if result_json:
                    try:
                        res = json.loads(result_json)
                        return res.get('resultUrls', [])[0]
                    except:
                        return result_json 
                return None
            elif state == 'fail':
                raise Exception("Task state: fail")
            
            raise Exception("Task still processing")

    async def generate_hero_image(self, prompt: str) -> str:
        logger.info(f"Generating Hero Image with prompt: {prompt}")
        task_id = await self.create_task("nano-banana-pro", {
            "prompt": prompt,
            "aspect_ratio": "1:1",
            "resolution": "1K",
            "output_format": "png"
        })
        return await self.poll_task(task_id)

    async def remove_text(self, image_url: str) -> str:
        logger.info(f"Removing text from: {image_url}")
        task_id = await self.create_task("google/nano-banana-edit", {
            "prompt": "give me this image with no text, erase text",
            "image_urls": [image_url],
            "output_format": "png",
            "image_size": "1:1"
        })
        return await self.poll_task(task_id)
