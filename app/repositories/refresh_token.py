from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.refresh_token import RefreshToken
from app.repositories.base import BaseRepository

class RefreshTokenRepository(BaseRepository):
    model = RefreshToken

    @classmethod
    async def get_by_hash(cls, token_hash: str, db: AsyncSession) -> RefreshToken | None:
        result = await db.execute(select(cls.model).where(cls.model.token_hash == token_hash))
        return result.scalar_one_or_none()
