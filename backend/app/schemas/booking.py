import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.booking import BookingStatus

class BookingCreate(BaseModel):
    room_id: int
    bed_number: int | None = Field(None, ge=1)
    date_from: datetime.date
    date_to: datetime.date
    guests: int = Field(1, ge=1)

class BedSelection(BaseModel):
    room_id: int
    bed_number: int = Field(..., ge=1)

class MultiBookingCreate(BaseModel):
    """Book several rooms at once (same dates), e.g. a family needing 2 rooms."""
    room_ids: list[int] = Field(default_factory=list, max_length=20)
    bed_selections: list[BedSelection] = Field(default_factory=list, max_length=100)
    date_from: datetime.date
    date_to: datetime.date
    guests: int = Field(1, ge=1)

class WalkInBookingCreate(BaseModel):
    """Booking(s) created by reception/admin for a guest who has no account on the site."""
    room_ids: list[int] = Field(..., min_length=1, max_length=20)
    date_from: datetime.date
    date_to: datetime.date
    guests: int = Field(1, ge=1)
    guest_name: str = Field(..., min_length=2, max_length=100)
    guest_phone: str | None = Field(None, max_length=25)
    # If the guest is already at the hotel, check them in immediately instead of just confirming.
    check_in_now: bool = False

class BookingResponse(BaseModel):
    id: int
    user_id: int | None = None
    guest_name: str | None = None
    guest_phone: str | None = None
    room_id: int
    bed_number: int | None = None
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


class AdminBookingResponse(BaseModel):
    """Booking enriched with guest/hotel/room labels for the admin bookings list."""
    id: int
    user_id: int | None = None
    guest_name: str
    guest_phone: str | None = None
    room_id: int
    room_number: str
    hotel_id: int
    hotel_name: str
    date_from: datetime.date
    date_to: datetime.date
    guests: int
    total_amount: Decimal
    deposit_amount: Decimal
    is_paid: bool
    status: BookingStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime
