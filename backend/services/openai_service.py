
from openai import AsyncOpenAI
from config import get_settings
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

    async def generate_viral_structure(self, topic: str, count: int = 5) -> dict:
        """Generates content specifically for the 'AI Viral' mode"""
        system_prompt = f"""You are a viral social media expert. 
        Generate content for a {count}-slide carousel about '{topic}'.
        
        Return a JSON object with:
        1. 'hero': {{
            'topheadline': 'Short punchy hook',
            'bottomheadline': 'Intriguing subhook'
        }}
        2. 'slides': Array of {count-1} objects (excluding hero) for the body slides. Each must have:
            - 'title': Headline
            - 'content': Body text (max 40 words)
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system_prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            raise

    async def generate_slides_content(self, topic: str, count: int = 5, context: str = "") -> list[dict]:
        system_prompt = f"""You are a social media expert. Generate a {count}-slide carousel. 
        Return ONLY a JSON object with a 'slides' key containing an array of {count} objects.
        
        Structure logic:
        - Slide 1 MUST be type='hero'.
        - Middle slides MUST be type='body'.
        - Last slide MUST be type='cta'.

        Each object must have:
        - 'type': 'hero', 'body', or 'cta'.
        - 'title': Short, punchy headline.
        - 'content': The main text (max 40 words).
        - 'background_prompt': A visual description for DALL-E 3 (Abstract, texture, minimalist, 4k, no text).
        """
        
        user_prompt = f"Topic: {topic}\nSlide Count: {count}\nContext: {context}"

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
