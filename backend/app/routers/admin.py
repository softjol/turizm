import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db

from app.schemas.dashboard import AdminDashboardResponse
from app.schemas.user import UserResponse, UserUpdate, UserRoleUpdate
from app.schemas.hotel_type import HotelTypeResponse, HotelTypeCreate, HotelTypeUpdate
from app.schemas.amenity import AmenityResponse, AmenityCreate, AmenityUpdate
from app.schemas.hotel import HotelResponse, HotelStatusUpdate
from app.schemas.complaint import ComplaintResponse, ComplaintStatusUpdate
from app.schemas.booking import BookingResponse, AdminBookingResponse

from app.services.dashboard import DashboardService
from app.services.complaint import ComplaintService
from app.services.hotel import HotelService
from app.services.booking import BookingService

from app.repositories.user import UserRepository
from app.repositories.hotel_type import HotelTypeRepository
from app.repositories.amenity import AmenityRepository
from app.repositories.complaint import ComplaintRepository
from app.repositories.hotel import HotelRepository
from app.repositories.booking import BookingRepository

from app.dependencies.dependencies import get_current_user, require_role
from app.models.user import User
from app.models.hotel import HotelStatus
from app.models.booking import BookingStatus
from app.models.payment import PaymentStatus

router = APIRouter(tags=["Admin"])

# === Dashboard ===
@router.get("/admin/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    start_date: datetime.date | None = Query(None),
    end_date: datetime.date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Сводная статистика платформы."""
    return await DashboardService.get_admin_dashboard(db, start_date, end_date)

# === Users ===
@router.get("/users", response_model=list[UserResponse])
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Список пользователей."""
    return await UserRepository.get_all(db, page=page, limit=limit)

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Данные пользователя."""
    user = await UserRepository.get_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    req: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Редактирование пользователя."""
    user = await UserRepository.get_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = await UserRepository.update(user, req, db)
    await db.commit()
    return updated

@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def assign_role(
    user_id: int,
    req: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Назначение роли."""
    user = await UserRepository.get_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = req.role
    await db.commit()
    await db.refresh(user)
    return user

@router.patch("/users/{user_id}/block", response_model=UserResponse)
async def block_user(
    user_id: int,
    is_active: bool = Query(..., description="False to block, True to unblock"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Блокировка / разблокировка."""
    user = await UserRepository.get_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    await db.commit()
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Удаление пользователя."""
    user = await UserRepository.get_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await UserRepository.delete(user, db)
    await db.commit()

# === Hotel Types ===
@router.get("/hotel-types", response_model=list[HotelTypeResponse])
async def get_hotel_types(db: AsyncSession = Depends(get_db)): # Публичный
    return await HotelTypeRepository.get_all(db)

@router.post("/hotel-types", response_model=HotelTypeResponse, status_code=201)
async def create_hotel_type(req: HotelTypeCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    from app.models.hotel_type import HotelType
    ht = HotelType(name=req.name, slug=req.slug)
    await HotelTypeRepository.create(ht, db)
    await db.commit()
    return ht

@router.patch("/hotel-types/{id}", response_model=HotelTypeResponse)
async def update_hotel_type(id: int, req: HotelTypeUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    ht = await HotelTypeRepository.get_by_id(id, db)
    if not ht: raise HTTPException(404, "Not found")
    updated = await HotelTypeRepository.update(ht, req, db)
    await db.commit()
    return updated

@router.delete("/hotel-types/{id}", status_code=204)
async def delete_hotel_type(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    ht = await HotelTypeRepository.get_by_id(id, db)
    if not ht: raise HTTPException(404, "Not found")
    await HotelTypeRepository.delete(ht, db)
    await db.commit()

# === Amenities ===
@router.get("/amenities", response_model=list[AmenityResponse])
async def get_amenities(db: AsyncSession = Depends(get_db)): # Публичный
    return await AmenityRepository.get_all(db)

@router.post("/amenities", response_model=AmenityResponse, status_code=201)
async def create_amenity(req: AmenityCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    from app.models.amenity import Amenity
    am = Amenity(name=req.name, slug=req.slug)
    await AmenityRepository.create(am, db)
    await db.commit()
    return am

@router.patch("/amenities/{id}", response_model=AmenityResponse)
async def update_amenity(id: int, req: AmenityUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    am = await AmenityRepository.get_by_id(id, db)
    if not am: raise HTTPException(404, "Not found")
    updated = await AmenityRepository.update(am, req, db)
    await db.commit()
    return updated

@router.delete("/amenities/{id}", status_code=204)
async def delete_amenity(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    am = await AmenityRepository.get_by_id(id, db)
    if not am: raise HTTPException(404, "Not found")
    await AmenityRepository.delete(am, db)
    await db.commit()

# === Hotels Moderation ===
@router.get("/admin/hotels", response_model=list[HotelResponse])
async def list_all_hotels(
    status: HotelStatus | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Все объекты для модерации (любой статус), новые сверху."""
    return await HotelRepository.list_all(db, status=status, page=page, limit=limit)

@router.patch("/hotels/{hotel_id}/status", response_model=HotelResponse)
async def moderate_hotel(hotel_id: int, req: HotelStatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    """Модерация: approve / reject / block"""
    return await HotelService.update_status(hotel_id, req.status, db)

@router.delete("/hotels/{hotel_id}", status_code=204)
async def delete_hotel(hotel_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin", "reception"))):
    hotel = await HotelRepository.get_by_id(hotel_id, db)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    if current_user.role.value == "reception" and hotel.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    await HotelService.delete_hotel(hotel_id, db)

# === Bookings ===
@router.get("/admin/bookings", response_model=list[AdminBookingResponse])
async def list_all_bookings(
    status: BookingStatus | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Все бронирования платформы, с фильтром по статусу."""
    bookings = await BookingRepository.get_bookings(db, status=status, page=page, limit=limit)
    return [
        AdminBookingResponse(
            id=b.id,
            user_id=b.user_id,
            guest_name=b.user.name if b.user else (b.guest_name or f"Гость #{b.id}"),
            guest_phone=b.guest_phone,
            room_id=b.room_id,
            room_number=b.room.room_number if b.room else "-",
            hotel_id=b.room.hotel_id if b.room else 0,
            hotel_name=b.room.hotel.name if b.room and b.room.hotel else "-",
            date_from=b.date_from,
            date_to=b.date_to,
            guests=b.guests,
            total_amount=b.total_amount,
            deposit_amount=b.deposit_amount,
            is_paid=any(p.status == PaymentStatus.paid for p in b.payments),
            status=b.status,
            created_at=b.created_at,
            updated_at=b.updated_at,
        )
        for b in bookings
    ]

@router.patch("/admin/bookings/{booking_id}/cancel", response_model=BookingResponse)
async def admin_cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Отмена бронирования администратором."""
    return await BookingService.cancel_booking(booking_id, current_user.id, True, db)

# === Complaints ===
@router.get("/complaints", response_model=list[ComplaintResponse])
async def get_complaints(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return await ComplaintRepository.get_all(db, page=page, limit=limit)

@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    comp = await ComplaintRepository.get_by_id(complaint_id, db)
    if not comp: raise HTTPException(404, "Not found")
    return comp

@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: int,
    req: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return await ComplaintService.update_status(complaint_id, req.status, db)
