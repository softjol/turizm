from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.repositories.notification import NotificationRepository

class NotificationService:

    @classmethod
    async def create_notification(cls, db: AsyncSession, user_id: int, title: str, body: str, type: str = "system") -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            body=body,
            type=type,
            is_read=False
        )
        await NotificationRepository.create(notification, db)
        await db.commit()
        return notification

    @classmethod
    async def mark_as_read(cls, db: AsyncSession, notification_id: int, user_id: int):
        notification = await NotificationRepository.get_by_id(notification_id, db)
        if notification and notification.user_id == user_id:
            notification.is_read = True
            await db.commit()

    @classmethod
    async def mark_all_as_read(cls, db: AsyncSession, user_id: int):
        notifications = await NotificationRepository.get_all(db, user_id=user_id)
        for notif in notifications:
            notif.is_read = True
        await db.commit()

    @classmethod
    async def get_user_notifications(cls, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 20):
        # В идеале нужно сделать пагинацию в репозитории, но для простоты:
        return await NotificationRepository.get_all(db, user_id=user_id)
