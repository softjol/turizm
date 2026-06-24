from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking import BookingService
from app.repositories.booking import BookingRepository
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings (User)"])

@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    req: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание бронирования пользователем."""
    return await BookingService.create_booking(current_user.id, req, db)

@router.get("", response_model=list[BookingResponse])
async def get_my_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список своих бронирований для User."""
    bookings = await BookingRepository.get_bookings(db, user_id=current_user.id, page=page, limit=limit)
    return bookings

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Детальная информация о своём бронировании."""
    booking = await BookingRepository.get_by_id_with_relations(booking_id, db)
    if not booking or booking.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found or access denied")
    return booking

@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отменить своё бронирование."""
    from app.models.user import Role
    is_admin = (current_user.role == Role.admin)
    return await BookingService.cancel_booking(booking_id, current_user.id, is_admin, db)
