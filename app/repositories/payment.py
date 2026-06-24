from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment
from app.repositories.base import BaseRepository

class PaymentRepository(BaseRepository):
    model = Payment

    @classmethod
    async def get_by_external_id(cls, external_payment_id: str, db: AsyncSession) -> Payment | None:
        result = await db.execute(select(cls.model).where(cls.model.external_payment_id == external_payment_id))
        return result.scalar_one_or_none()
