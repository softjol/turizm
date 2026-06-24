import datetime
import enum
from sqlalchemy import DateTime, func, ForeignKey, Numeric, String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class PaymentStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=20),
        default=PaymentStatus.pending,
        nullable=False,
        index=True
    )
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    external_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    booking = relationship("Booking", back_populates="payments")
