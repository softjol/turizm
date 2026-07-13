import datetime
import enum
from sqlalchemy import DateTime, Date, func, ForeignKey, Numeric, Integer, Enum, String, CheckConstraint
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    cancelled = "cancelled"
    checked_in = "checked_in"
    checked_out = "checked_out"
    completed = "completed"

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # Null for walk-in guests created by reception without a site account (see guest_name/guest_phone).
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    guest_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    guest_phone: Mapped[str | None] = mapped_column(String(25), nullable=True)
    date_from: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    date_to: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    guests: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, native_enum=False, length=20),
        default=BookingStatus.pending,
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        ExcludeConstraint(
            ('room_id', '='),
            (func.daterange(date_from, date_to), '&&'),
            where=(status.in_(['pending', 'confirmed', 'checked_in'])),
            name='exclude_booking_overlap'
        ),
        CheckConstraint(
            "user_id IS NOT NULL OR guest_name IS NOT NULL",
            name="check_booking_has_guest"
        ),
    )

    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    review = relationship("Review", uselist=False, back_populates="booking", cascade="all, delete-orphan")
