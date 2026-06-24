import datetime
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5)

class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    comment: str | None = Field(None, min_length=5)

class ReviewReply(BaseModel):
    reply: str = Field(..., min_length=2)

class ReviewResponse(BaseModel):
    id: int
    hotel_id: int
    user_id: int
    booking_id: int
    rating: int
    comment: str
    reply: str | None = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
