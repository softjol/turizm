import datetime
from pydantic import BaseModel

class ImageResponse(BaseModel):
    id: int
    hotel_id: int | None = None
    room_id: int | None = None
    url: str
    is_main: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ImageCreate(BaseModel):
    url: str
    is_main: bool = False
