import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.room import RoomType, RoomStatus
from app.schemas.image import ImageResponse
from app.schemas.amenity import AmenityResponse

class RoomResponse(BaseModel):
    id: int
    hotel_id: int
    room_number: str
    name: str
    type: RoomType
    price_per_night: Decimal
    capacity_adults: int
    capacity_children: int
    description: str
    status: RoomStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    images: list[ImageResponse] = []
    amenities: list[AmenityResponse] = []

    class Config:
        from_attributes = True

class RoomCreate(BaseModel):
    room_number: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    type: RoomType = RoomType.standard
    price_per_night: Decimal = Field(..., gt=0)
    capacity_adults: int = Field(2, ge=1)
    capacity_children: int = Field(0, ge=0)
    description: str = Field(..., min_length=5)
    status: RoomStatus = RoomStatus.available

class RoomUpdate(BaseModel):
    room_number: str | None = None
    name: str | None = None
    type: RoomType | None = None
    price_per_night: Decimal | None = None
    capacity_adults: int | None = None
    capacity_children: int | None = None
    description: str | None = None
    status: RoomStatus | None = None

class RoomAvailabilityUpdate(BaseModel):
    status: RoomStatus

class RoomAmenitiesUpdate(BaseModel):
    amenity_ids: list[int]
