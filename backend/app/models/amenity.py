import datetime
from sqlalchemy import DateTime, func, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class HotelAmenity(Base):
    __tablename__ = "hotel_amenities"

    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), primary_key=True)
    amenity_id: Mapped[int] = mapped_column(ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)

class RoomAmenity(Base):
    __tablename__ = "room_amenities"

    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True)
    amenity_id: Mapped[int] = mapped_column(ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)

class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    hotels = relationship("Hotel", secondary="hotel_amenities", back_populates="amenities")
    rooms = relationship("Room", secondary="room_amenities", back_populates="amenities")
