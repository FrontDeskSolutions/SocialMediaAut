
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

# Shared Theme Definitions (kept for reference)
THEME_COLORS = {
  "trust_clarity": {"name": "Trust & Clarity", "c1": "#0F172A", "c2": "#475569"},
  "modern_luxury": {"name": "Modern Luxury", "c1": "#1C1C1C", "c2": "#6D6D6D"},
  # ... others ...
}

class Slide(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    background_prompt: str
    background_url: Optional[str] = None
    
    # Design Properties
    type: str = "body"       
    layout: str = "default"
    variant: str = "1"       
    
    # Style Properties
    font: str = "modern"     # modern, serif, mono, bold, handwritten, futuristic, editorial
    text_effect: str = "none" 
    theme: str = "trust_clarity" 
    arrow_color: str = "#ffffff"
    text_bg_enabled: bool = True
    
    # AI-Analyzed Properties
    font_color: Optional[str] = None # Overlay color decided by AI vision
    spacing: str = "normal" # compact, normal, wide

class GenerationBase(BaseModel):
    topic: str
    slide_count: int = 5
    status: str = "pending"
    mode: str = "standard"
    theme: str = "trust_clarity"

class GenerationCreate(GenerationBase):
    pass

class Generation(GenerationBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slides: List[Slide] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(extra="ignore")

class WebhookPayload(BaseModel):
    topic: str
    slide_count: int = 5
    theme: str = "trust_clarity"
    rss_source: Optional[str] = None
    extra_context: Optional[str] = None
