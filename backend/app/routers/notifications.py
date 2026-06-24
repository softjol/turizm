from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.notification import NotificationResponse
from app.services.notification import NotificationService
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=list[NotificationResponse])
async def get_my_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список уведомлений текущего пользователя."""
    return await NotificationService.get_user_notifications(db, current_user.id, skip=skip, limit=limit)

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отметить уведомление прочитанным."""
    await NotificationService.mark_as_read(db, notification_id, current_user.id)
    return {"message": "Marked as read"}

@router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отметить все уведомления прочитанными."""
    await NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": "All marked as read"}
