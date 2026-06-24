from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.complaint import ComplaintService
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/complaints", tags=["Complaints (User)"])

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    req: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Подать жалобу (на отель, комнату, пользователя, бронь или отзыв)."""
    return await ComplaintService.create_complaint(current_user.id, req, db)
