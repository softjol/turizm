import datetime
from pydantic import BaseModel, Field

class AmenityResponse(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AmenityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    slug: str = Field(..., min_length=2, max_length=50)

class AmenityUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=50)
    slug: str | None = Field(None, min_length=2, max_length=50)
