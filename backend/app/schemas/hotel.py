import datetime
from pydantic import BaseModel, Field
from app.models.hotel import HotelStatus
from app.schemas.hotel_type import HotelTypeResponse
from app.schemas.image import ImageResponse
from app.schemas.amenity import AmenityResponse

class HotelResponse(BaseModel):
    id: int
    owner_id: int
    hotel_type_id: int
    name: str
    description: str
    address: str
    latitude: float | None = None
    longitude: float | None = None
    phone: str
    whatsapp: str
    email: str | None = None
    check_in_time: str
    check_out_time: str
    status: HotelStatus
    rating: float
    created_at: datetime.datetime
    updated_at: datetime.datetime

    # Aggregates populated by the search/list endpoint so the catalog can render
    # cards (price + review count) without N+1 calls. Null/0 on detail responses.
    price_from: float | None = None
    reviews_count: int = 0

    hotel_type: HotelTypeResponse | None = None
    images: list[ImageResponse] = []
    amenities: list[AmenityResponse] = []

    class Config:
        from_attributes = True

class HotelCreate(BaseModel):
    hotel_type_id: int
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10)
    address: str = Field(..., min_length=5)
    latitude: float | None = None
    longitude: float | None = None
    phone: str = Field(..., min_length=5)
    whatsapp: str = Field(..., min_length=5)
    email: str | None = None
    check_in_time: str = "14:00"
    check_out_time: str = "12:00"

class HotelUpdate(BaseModel):
    hotel_type_id: int | None = None
    name: str | None = None
    description: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    whatsapp: str | None = None
    email: str | None = None
    check_in_time: str | None = None
    check_out_time: str | None = None

class HotelStatusUpdate(BaseModel):
    status: HotelStatus

class HotelAmenitiesUpdate(BaseModel):
    amenity_ids: list[int]
