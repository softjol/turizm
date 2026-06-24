import datetime
import enum
from sqlalchemy import DateTime, func, String, ForeignKey, Text, Numeric, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class RoomType(enum.Enum):
    standard = "standard"
    semi_lux = "semi_lux"
    lux = "lux"
    family = "family"
    dorm = "dorm"

class RoomStatus(enum.Enum):
    available = "available"
    maintenance = "maintenance"
    inactive = "inactive"

class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[RoomType] = mapped_column(
        Enum(RoomType, native_enum=False, length=20), nullable=False, default=RoomType.standard
    )
    price_per_night: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    capacity_adults: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    capacity_children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[RoomStatus] = mapped_column(
        Enum(RoomStatus, native_enum=False, length=20),
        default=RoomStatus.available,
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    hotel = relationship("Hotel", back_populates="rooms")
    images = relationship("Image", back_populates="room", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="room", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary="room_amenities", back_populates="rooms")
