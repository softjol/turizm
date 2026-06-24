import datetime
import os
import shutil
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db

from app.schemas.dashboard import ReceptionDashboardResponse, ReceptionFinanceResponse
from app.schemas.hotel import HotelCreate, HotelUpdate, HotelResponse, HotelAmenitiesUpdate
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomAvailabilityUpdate, RoomAmenitiesUpdate
from app.schemas.booking import BookingResponse
from app.schemas.image import ImageResponse
from app.schemas.review import ReviewResponse, ReviewReply

from app.services.dashboard import DashboardService
from app.services.hotel import HotelService
from app.services.room import RoomService
from app.services.booking import BookingService
from app.services.review import ReviewService

from app.repositories.booking import BookingRepository

from app.dependencies.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/reception", tags=["Reception"])

def get_is_admin(user: User) -> bool:
    from app.models.user import Role
    return user.role == Role.admin

# === Dashboard & Finance ===
@router.get("/hotels/{hotel_id}/dashboard", response_model=ReceptionDashboardResponse)
async def get_reception_dashboard(
    hotel_id: int,
    target_date: datetime.date = Query(..., description="Date to fetch dashboard metrics for"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    """Дашборд ресепшена (по своей гостинице)."""
    # В реальном проекте тут нужна проверка прав (владелец ли он)
    # Для этого можно запросить отель и проверить owner_id
    # Для упрощения MVP предполагается, что сервис/репозиторий сам отфильтрует, или добавим ручную проверку.
    return await DashboardService.get_reception_dashboard(db, hotel_id, target_date)

@router.get("/hotels/{hotel_id}/finance", response_model=ReceptionFinanceResponse)
async def get_reception_finance(
    hotel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    """Финансовая статистика ресепшена."""
    return await DashboardService.get_reception_finance(db, hotel_id)

# === Hotel Management ===
@router.get("/reception/hotels", response_model=list[HotelResponse])
async def get_my_hotels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await HotelService.get_hotels_by_owner(current_user.id, db)

@router.post("/hotels", response_model=HotelResponse, status_code=201)
async def create_hotel(
    req: HotelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await HotelService.create_hotel(current_user.id, req, db)

@router.patch("/hotels/{hotel_id}", response_model=HotelResponse)
async def update_hotel(
    hotel_id: int,
    req: HotelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await HotelService.update_hotel(hotel_id, current_user.id, get_is_admin(current_user), req, db)

@router.put("/hotels/{hotel_id}/amenities", response_model=HotelResponse)
async def set_hotel_amenities(
    hotel_id: int,
    req: HotelAmenitiesUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await HotelService.set_amenities(hotel_id, current_user.id, get_is_admin(current_user), req.amenity_ids, db)

@router.post("/hotels/{hotel_id}/images", response_model=ImageResponse, status_code=201)
async def upload_hotel_image(
    hotel_id: int,
    file: UploadFile = File(...),
    is_main: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    os.makedirs("static/uploads/hotels", exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("static/uploads/hotels", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/{filepath}"

    return await HotelService.add_image(hotel_id, current_user.id, get_is_admin(current_user), url, is_main, db)

@router.delete("/hotels/{hotel_id}/images/{image_id}", status_code=204)
async def delete_hotel_image(
    hotel_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    await HotelService.delete_image(hotel_id, image_id, current_user.id, get_is_admin(current_user), db)

# === Room Management ===
@router.post("/hotels/{hotel_id}/rooms", response_model=RoomResponse, status_code=201)
async def create_room(
    hotel_id: int,
    req: RoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await RoomService.create_room(hotel_id, current_user.id, get_is_admin(current_user), req, db)

@router.patch("/rooms/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    req: RoomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await RoomService.update_room(room_id, current_user.id, get_is_admin(current_user), req, db)

@router.delete("/rooms/{room_id}", status_code=204)
async def delete_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    await RoomService.delete_room(room_id, current_user.id, get_is_admin(current_user), db)

@router.put("/rooms/{room_id}/amenities", response_model=RoomResponse)
async def set_room_amenities(
    room_id: int,
    req: RoomAmenitiesUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await RoomService.set_amenities(room_id, current_user.id, get_is_admin(current_user), req.amenity_ids, db)

@router.patch("/rooms/{room_id}/availability", response_model=RoomResponse)
async def update_room_availability(
    room_id: int,
    req: RoomAvailabilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await RoomService.update_availability(room_id, current_user.id, get_is_admin(current_user), req.status, db)

@router.post("/rooms/{room_id}/images", response_model=ImageResponse, status_code=201)
async def upload_room_image(
    room_id: int,
    file: UploadFile = File(...),
    is_main: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    os.makedirs("static/uploads/rooms", exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("static/uploads/rooms", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/{filepath}"

    return await RoomService.add_image(room_id, current_user.id, get_is_admin(current_user), url, is_main, db)

@router.delete("/rooms/{room_id}/images/{image_id}", status_code=204)
async def delete_room_image(
    room_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    await RoomService.delete_image(room_id, image_id, current_user.id, get_is_admin(current_user), db)

# === Booking Management (Reception) ===
@router.get("/hotels/{hotel_id}/bookings", response_model=list[BookingResponse])
async def get_hotel_bookings(
    hotel_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    # Тут тоже нужна проверка, что отель принадлежит reception
    return await BookingRepository.get_bookings(db, hotel_id=hotel_id, page=page, limit=limit)

@router.patch("/bookings/{booking_id}/confirm", response_model=BookingResponse)
async def confirm_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await BookingService.confirm_booking(booking_id, current_user.id, get_is_admin(current_user), db)

@router.patch("/bookings/{booking_id}/reject", response_model=BookingResponse)
async def reject_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await BookingService.reject_booking(booking_id, current_user.id, get_is_admin(current_user), db)

@router.patch("/bookings/{booking_id}/check-in", response_model=BookingResponse)
async def check_in_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await BookingService.check_in(booking_id, current_user.id, get_is_admin(current_user), db)

@router.patch("/bookings/{booking_id}/check-out", response_model=BookingResponse)
async def check_out_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await BookingService.check_out(booking_id, current_user.id, get_is_admin(current_user), db)

# === Review Reply ===
@router.patch("/reviews/{review_id}/reply", response_model=ReviewResponse)
async def reply_review(
    review_id: int,
    req: ReviewReply,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("reception", "admin"))
):
    return await ReviewService.reply_review(review_id, current_user.id, get_is_admin(current_user), req.reply, db)
