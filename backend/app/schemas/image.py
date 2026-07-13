import datetime
from pydantic import BaseModel

class ImageResponse(BaseModel):
    id: int
    hotel_id: int | None = None
    room_id: int | None = None
    url: str
    is_main: bool
    sort_order: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ImageCreate(BaseModel):
    url: str
    is_main: bool = False

class ImageReorderRequest(BaseModel):
    """Ordered list of ALL image ids belonging to the hotel/room, in the desired order."""
    image_ids: list[int]
