from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.booking import Booking
from app.models.room import Room
from app.models.hotel import Hotel
from app.repositories.base import BaseRepository

class BookingRepository(BaseRepository):
    model = Booking

    @classmethod
    async def get_by_id_with_relations(cls, booking_id: int, db: AsyncSession) -> Booking | None:
        query = (
            select(cls.model)
            .where(cls.model.id == booking_id)
            .options(
                selectinload(cls.model.user),
                selectinload(cls.model.room).selectinload(Room.hotel),
                selectinload(cls.model.payments),
                selectinload(cls.model.review)
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def get_bookings(
        cls,
        db: AsyncSession,
        user_id: int | None = None,
        hotel_id: int | None = None,
        page: int = 1,
        limit: int = 10
    ) -> list[Booking]:
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        query = select(cls.model)

        if user_id is not None:
            query = query.where(cls.model.user_id == user_id)

        if hotel_id is not None:
            query = query.join(cls.model.room).join(Room.hotel).where(Hotel.id == hotel_id)

        query = query.order_by(cls.model.created_at.desc()).offset(offset).limit(limit)
        query = query.options(
            selectinload(cls.model.user),
            selectinload(cls.model.room).selectinload(Room.hotel),
            selectinload(cls.model.payments)
        )

        result = await db.execute(query)
        return result.scalars().all()

    @classmethod
    async def check_overlap(
        cls,
        db: AsyncSession,
        room_id: int,
        date_from: str,
        date_to: str,
        exclude_booking_id: int | None = None
    ) -> bool:
        from app.models.booking import BookingStatus
        query = select(cls.model).where(
            cls.model.room_id == room_id,
            cls.model.status.in_([BookingStatus.pending, BookingStatus.confirmed, BookingStatus.checked_in]),
            cls.model.date_from < date_to,
            cls.model.date_to > date_from
        )
        if exclude_booking_id is not None:
            query = query.where(cls.model.id != exclude_booking_id)

        result = await db.execute(query.limit(1))
        return result.scalar_one_or_none() is not None
