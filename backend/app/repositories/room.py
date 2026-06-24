import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.room import Room, RoomStatus
from app.models.booking import Booking, BookingStatus
from app.repositories.base import BaseRepository

class RoomRepository(BaseRepository):
    model = Room

    @classmethod
    async def get_by_id_with_relations(cls, room_id: int, db: AsyncSession) -> Room | None:
        query = (
            select(cls.model)
            .where(cls.model.id == room_id)
            .options(
                selectinload(cls.model.hotel),
                selectinload(cls.model.images),
                selectinload(cls.model.amenities),
                selectinload(cls.model.bookings)
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_hotel_id(cls, hotel_id: int, db: AsyncSession) -> list[Room]:
        """Rooms of a hotel with images + amenities eager-loaded for serialization."""
        query = (
            select(cls.model)
            .where(cls.model.hotel_id == hotel_id)
            .options(
                selectinload(cls.model.images),
                selectinload(cls.model.amenities),
            )
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def check_availability(
        cls, room_id: int, date_from: datetime.date, date_to: datetime.date, db: AsyncSession
    ) -> bool:
        # Check room status first
        room = await cls.get_by_id(room_id, db)
        if not room or room.status != RoomStatus.available:
            return False

        # Check overlapping bookings
        query = select(Booking).where(
            and_(
                Booking.room_id == room_id,
                Booking.status.in_([
                    BookingStatus.pending,
                    BookingStatus.confirmed,
                    BookingStatus.checked_in
                ]),
                Booking.date_from < date_to,
                Booking.date_to > date_from
            )
        )
        result = await db.execute(query)
        overlapping_booking = result.first()
        return overlapping_booking is None
