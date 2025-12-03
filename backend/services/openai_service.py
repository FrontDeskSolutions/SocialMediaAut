
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

    async def analyze_design_from_image(self, image_url: str) -> dict:
        """
        Uses GPT-4o Vision to analyze the background image and recommend design settings.
        """
        system_prompt = """You are an expert UI/UX designer. 
        Analyze this background image which will be used for a social media slide.
        
        Determine the best overlay settings to ensure text is readable and the composition is balanced.
        
        Return JSON:
        {
            "font_color": "Hex color string that contrasts BEST with the background (e.g., #FFFFFF or #000000)",
            "font": "One of: modern, serif, mono, bold, handwritten, futuristic, editorial",
            "spacing": "One of: compact (if image has small border), normal, wide (if image has large border/clutter)"
        }
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o", 
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": system_prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=300
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Vision Analysis Error: {e}")
            # Fallback defaults
            return {"font_color": "#ffffff", "font": "modern", "spacing": "normal"}

    async def generate_slides_content(self, topic: str, count: int = 5, context: str = "") -> list[dict]:
        # (Standard Flow - Unchanged)
        system_prompt = f"""You are a social media expert. Generate a {count}-slide carousel. 
        Return ONLY a JSON object with a 'slides' key containing an array of {count} objects.
        """
        # ... (rest of standard logic preserved) ...
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
            return json.loads(response.choices[0].message.content).get("slides", [])
        except Exception:
            raise

    async def generate_image(self, prompt: str) -> str:
        # (Standard DALL-E Flow - Unchanged)
        try:
            response = await self.client.images.generate(
                model=self.dalle_model,
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1
            )
            return response.data[0].url
        except Exception:
            raise
