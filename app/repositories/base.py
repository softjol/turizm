from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class BaseRepository:
    model = None

    @classmethod
    async def create(cls, obj, db: AsyncSession):
        db.add(obj)
        await db.flush()
        return obj

    @classmethod
    async def update(cls, obj, data, db: AsyncSession):
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)

        await db.flush()
        return obj

    @classmethod
    async def delete(cls, obj, db:AsyncSession):
        await db.delete(obj)
        await db.flush()
        return obj

    @classmethod
    async def get_all(cls, db: AsyncSession, page: int = 1, limit: int = 10, order_by = None):
        page = max(page, 1)
        limit = min(max(limit, 1), 100)

        offset = (page - 1) * limit

        query = select(cls.model)
        if order_by is not None:
            query = query.order_by(order_by)

        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    @classmethod
    async def filter(
            cls,
            db: AsyncSession,
            *conditions,
            page: int = 1,
            limit: int = 10):
        page = max(page, 1)
        limit = min(max(limit, 1), 100)

        offset = (page - 1) * limit

        result = await db.execute(
            select(cls.model).
            where(*conditions).
            limit(limit).offset(offset))
        return result.scalars().all()

    @classmethod
    async def get_by_id(cls, obj_id: int, db: AsyncSession):
        result = await db.execute(select(cls.model).where(cls.model.id == obj_id))
        return result.scalar_one_or_none()