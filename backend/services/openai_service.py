
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
        system_prompt = """You are an expert UI/UX designer specializing in typography and accessibility.
        Analyze the attached background image to determine the optimal styling for a text overlay.
        
        Design Strategy:
        - Dark Glassmorphism: If background is dark/neon, use dark semi-transparent box.
        - Light Glassmorphism: If background is light, use white semi-transparent box.
        - Visual Hierarchy: Headline should separate from Body. Headline contrast is key.
        
        Return JSON:
        {
            "themeMode": "dark" (if bg is dark, text will be light) OR "light" (if bg is light, text will be dark),
            "primaryColor": "Hex code for Headline (pick a vibrant accent from the image)",
            "bodyColor": "Hex code for Body text (usually white or black)",
            "glassIntensity": "high", "medium", "low", or "none",
            "layout": "centered_stack" (default) or "split_left" / "split_right" if clear negative space exists,
            "containerOpacity": Float 0.0 to 1.0 (0.6 is standard for glass),
            "textShadow": boolean
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
            return {
                "themeMode": "dark",
                "primaryColor": "#FACC15", 
                "bodyColor": "#FFFFFF",
                "glassIntensity": "high",
                "layout": "centered_stack",
                "containerOpacity": 0.6,
                "textShadow": True
            }

    async def generate_slides_content(self, topic: str, count: int = 5, context: str = "") -> list[dict]:
        system_prompt = f"""You are a social media expert. Generate a {count}-slide carousel. 
        Return ONLY a JSON object with a 'slides' key containing an array of {count} objects.
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
            slides = json.loads(response.choices[0].message.content).get("slides", [])
            
            # Enforce CTA
            if slides:
                slides[-1]['type'] = 'cta'
                if 'CTA' not in slides[-1].get('title', '').upper() and 'ACTION' not in slides[-1].get('title', '').upper():
                    slides[-1]['title'] = "Ready to Learn More?"
                    slides[-1]['content'] = "Follow for more insights on this topic."
            
            return slides
        except Exception:
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
        except Exception:
            raise
