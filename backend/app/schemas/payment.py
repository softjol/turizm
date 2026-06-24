import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.payment import PaymentStatus

class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: str = Field(..., min_length=2, max_length=50)

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: Decimal
    status: PaymentStatus
    payment_method: str
    external_payment_id: str | None = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PaymentWebhook(BaseModel):
    external_payment_id: str
    booking_id: int
    amount: Decimal
    status: str  # paid, failed, etc.
    payment_method: str
