
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class Slide(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    background_prompt: str
    background_url: Optional[str] = None
    
    # Design Properties
    type: str = "body"       # hero, body, cta
    layout: str = "default"  # varies by type
    variant: str = "1"       # For CTA: 1, 2, 3
    
    # Style Properties
    font: str = "modern"     # modern, serif, mono, bold
    text_effect: str = "none" # none, glow, gradient, chrome, glitch, neon

class GenerationBase(BaseModel):
    topic: str
    slide_count: int = 5
    status: str = "pending"

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
    rss_source: Optional[str] = None
    extra_context: Optional[str] = None
