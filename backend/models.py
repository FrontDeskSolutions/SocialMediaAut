
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

# Shared Theme Definitions
THEME_COLORS = {
  "trust_clarity": {"name": "Trust & Clarity", "c1": "#0F172A", "c2": "#475569"},
  "modern_luxury": {"name": "Modern Luxury", "c1": "#1C1C1C", "c2": "#6D6D6D"},
  "swiss_minimalist": {"name": "Swiss Minimalist", "c1": "#000000", "c2": "#555555"},
  "forest_executive": {"name": "Forest Executive", "c1": "#064E3B", "c2": "#3F6258"},
  "warm_editorial": {"name": "Warm Editorial", "c1": "#4A3B32", "c2": "#8C7B70"},
  "dark_mode_premium": {"name": "Dark Mode Premium", "c1": "#18181B", "c2": "#A1A1AA"},
  "slate_clay": {"name": "Slate & Clay", "c1": "#334155", "c2": "#94A3B8"},
  "royal_academic": {"name": "Royal Academic", "c1": "#2E1065", "c2": "#584A6D"},
  "industrial_chic": {"name": "Industrial Chic", "c1": "#262626", "c2": "#737373"},
  "sunset_corporate": {"name": "Sunset Corporate", "c1": "#7C2D12", "c2": "#A87666"},
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
    font: str = "modern"
    text_effect: str = "none"
    theme: str = "trust_clarity" 
    arrow_color: str = "#ffffff"
    text_bg_enabled: bool = True
    
    # AI-Analyzed / Advanced Layout Properties
    font_color: Optional[str] = None # Body text color
    headline_color: Optional[str] = None # NEW: Separate headline color
    text_position: str = "middle_center"
    text_align: str = "center" 
    container_opacity: float = 0.8 
    text_shadow: bool = False
    text_width: str = "medium" 

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
