from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.repositories.base import BaseRepository

class ReviewRepository(BaseRepository):
    model = Review

    @classmethod
    async def get_hotel_rating_metrics(cls, hotel_id: int, db: AsyncSession) -> tuple[int, float]:
        query = select(
            func.count(cls.model.id),
            func.avg(cls.model.rating)
        ).where(cls.model.hotel_id == hotel_id)
        
        result = await db.execute(query)
        count, avg_rating = result.one()
        return count or 0, float(avg_rating or 0.0)

    @classmethod
    async def get_by_booking_id(cls, booking_id: int, db: AsyncSession) -> Review | None:
        result = await db.execute(select(cls.model).where(cls.model.booking_id == booking_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_hotel_id(cls, hotel_id: int, db: AsyncSession) -> list[Review]:
        result = await db.execute(select(cls.model).where(cls.model.hotel_id == hotel_id))
        return result.scalars().all()
