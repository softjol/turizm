import datetime
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.otp_code import OtpCode
from app.repositories.base import BaseRepository

class OtpCodeRepository(BaseRepository):
    model = OtpCode

    @classmethod
    async def get_latest_active_otp(cls, phone: str, db: AsyncSession) -> OtpCode | None:
        now = datetime.datetime.now(datetime.timezone.utc)
        query = (
            select(cls.model)
            .where(
                and_(
                    cls.model.whatsapp_phone_number == phone,
                    cls.model.is_used == False,
                    cls.model.expires_at > now
                )
            )
            .order_by(desc(cls.model.created_at))
            .limit(1)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()
