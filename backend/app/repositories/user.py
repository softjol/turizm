from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository):
    model = User

    @classmethod
    async def get_by_phone(cls, phone: str, db: AsyncSession) -> User | None:
        result = await db.execute(select(cls.model).where(cls.model.whatsapp_phone_number == phone))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_email(cls, email: str, db: AsyncSession) -> User | None:
        result = await db.execute(select(cls.model).where(cls.model.email == email))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_google_id(cls, google_id: str, db: AsyncSession) -> User | None:
        result = await db.execute(select(cls.model).where(cls.model.google_id == google_id))
        return result.scalar_one_or_none()
