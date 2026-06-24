import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.booking import BookingStatus

class BookingCreate(BaseModel):
    room_id: int
    date_from: datetime.date
    date_to: datetime.date
    guests: int = Field(1, ge=1)

class BookingResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    date_from: datetime.date
    date_to: datetime.date
    guests: int
    total_amount: Decimal
    deposit_amount: Decimal
    status: BookingStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
