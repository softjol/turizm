from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.review import ReviewService
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Reviews (User)"])

@router.post("/hotels/{hotel_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    hotel_id: int,
    req: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать отзыв по завершённому бронированию."""
    return await ReviewService.create_review(current_user.id, hotel_id, req, db)

@router.patch("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    req: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Редактировать свой отзыв."""
    from app.models.user import Role
    is_admin = (current_user.role == Role.admin)
    return await ReviewService.update_review(review_id, current_user.id, is_admin, req, db)

@router.delete("/reviews/{review_id}", status_code=204)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить свой отзыв."""
    from app.models.user import Role
    is_admin = (current_user.role == Role.admin)
    await ReviewService.delete_review(review_id, current_user.id, is_admin, db)
    return None
