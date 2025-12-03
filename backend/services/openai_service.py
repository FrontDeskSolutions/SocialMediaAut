
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

    async def generate_viral_structure(self, topic: str, count: int = 5, business_name: str = None, business_type: str = None) -> dict:
        """Generates content specifically for the 'AI Viral' mode"""
        
        biz_context = ""
        if business_name:
            biz_context += f"\nBrand Name: {business_name}"
        if business_type:
            biz_context += f"\nBusiness Type: {business_type}"
            
        system_prompt = f"""You are a viral social media expert. 
        Generate content for a {count}-slide carousel about '{topic}'. 
        
        The body paragraphs must be narrative based, with the second to last slide being a conclusion/engagement/comment bait. 
        The last slide is a CTA.
        
        Context: {biz_context}
        
        Return a JSON object with:
        1. 'hero': {{
            'topheadline': 'Short punchy hook',
            'bottomheadline': 'Intriguing subhook'
        }}
        2. 'slides': Array of {count-1} objects.
           - The first {count-2} slides are BODY slides (Narrative/Value).
           - The FINAL slide must be a CTA (Call to Action) specifically for {business_name or 'the brand'}.
           
           Each object must have:
            - 'title': Headline
            - 'content': Body text (max 300 characters). For the CTA slide, the 'content' must be 10 words or less, relevant to the narrative, and entertaining.
            - 'type': 'body' or 'cta'
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
        Analyze this background image for a social media slide.
        
        Return JSON with these EXACT keys and value options:
        {
            "headline_color": "Hex code for Headline (High contrast against background, often vibrant)",
            "font_color": "Hex code for Body text (Readable)",
            "text_position": "One of: top_left, top_center, top_right, middle_left, middle_center, middle_right, bottom_left, bottom_center, bottom_right",
            "text_align": "left, center, or right",
            "containerOpacity": Float 0.0 to 1.0,
            "textShadow": true or false,
            "font": "One of: modern, serif, mono, bold, handwritten, futuristic, editorial",
            "text_width": "narrow, medium, or wide"
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
                "headline_color": "#FACC15", 
                "font_color": "#FFFFFF",
                "text_position": "middle_center",
                "text_align": "center",
                "containerOpacity": 0.6,
                "textShadow": True,
                "font": "modern"
            }

    async def generate_slides_content(self, topic: str, count: int = 5, context: str = "") -> list[dict]:
        # Legacy flow...
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
            return json.loads(response.choices[0].message.content).get("slides", [])
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
