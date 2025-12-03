
from openai import AsyncOpenAI
from app.config import get_settings
import json
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        self.model = settings.openai_model
        self.dalle_model = settings.dalle_model

    async def generate_slides_content(self, topic: str, context: str = "") -> list[dict]:
        system_prompt = """You are a social media expert. Generate a 5-slide carousel. 
        Return ONLY a JSON object with a 'slides' key containing an array of objects.
        Each object must have:
        - 'title': Short, punchy headline.
        - 'content': The main text (max 30 words).
        - 'background_prompt': A visual description for DALL-E 3 (Abstract, texture, minimalist, 4k, no text).
        """
        
        user_prompt = f"Topic: {topic}\nContext: {context}"

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            data = json.loads(content)
            return data.get("slides", [])
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            raise

    async def generate_image(self, prompt: str) -> str:
        try:
            response = await self.client.images.generate(
                model=self.dalle_model,
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1
            )
            return response.data[0].url
        except Exception as e:
            logger.error(f"DALL-E Error: {e}")
            raise
