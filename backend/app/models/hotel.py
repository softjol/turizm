import datetime
import enum
from sqlalchemy import DateTime, func, String, ForeignKey, Text, Numeric, Float, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class HotelStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    blocked = "blocked"

class Hotel(Base):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hotel_type_id: Mapped[int] = mapped_column(ForeignKey("hotel_types.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(11, 8), nullable=True)
    phone: Mapped[str] = mapped_column(String(25), nullable=False)
    whatsapp: Mapped[str] = mapped_column(String(25), nullable=False)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    check_in_time: Mapped[str] = mapped_column(String(10), default="14:00", nullable=False)
    check_out_time: Mapped[str] = mapped_column(String(10), default="12:00", nullable=False)
    status: Mapped[HotelStatus] = mapped_column(
        Enum(HotelStatus, native_enum=False, length=20),
        default=HotelStatus.pending,
        nullable=False,
        index=True
    )
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner = relationship("User", back_populates="hotels")
    hotel_type = relationship("HotelType", back_populates="hotels")
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="hotel", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="hotel", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary="hotel_amenities", back_populates="hotels")
