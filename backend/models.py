
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
    layout: str = "default"  # title, content, split

class GenerationBase(BaseModel):
    topic: str
    status: str = "pending" # pending, processing, completed, failed

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
    rss_source: Optional[str] = None
    extra_context: Optional[str] = None
