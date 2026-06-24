import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.room import RoomResponse
from app.repositories.room import RoomRepository

router = APIRouter(prefix="/rooms", tags=["Rooms (Public)"])

@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """Детальная информация о номере."""
    room = await RoomRepository.get_by_id_with_relations(room_id, db)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.get("/{room_id}/calendar")
async def get_room_calendar(
    room_id: int, 
    start_date: datetime.date = Query(...), 
    end_date: datetime.date = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Занятость номера по датам (для проверки доступности при бронировании)."""
    room = await RoomRepository.get_by_id(room_id, db)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    # В идеале нужно получить все подтвержденные брони для этого номера в заданном диапазоне.
    # Здесь мы используем RoomRepository.check_availability для каждой даты, 
    # либо одним запросом из Booking.
    from app.repositories.booking import BookingRepository
    from app.models.booking import BookingStatus
    from sqlalchemy import select

    query = select(BookingRepository.model).where(
        BookingRepository.model.room_id == room_id,
        BookingRepository.model.status.in_([BookingStatus.pending, BookingStatus.confirmed, BookingStatus.checked_in]),
        BookingRepository.model.date_from < end_date,
        BookingRepository.model.date_to > start_date
    )
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    occupied_periods = [{"date_from": b.date_from, "date_to": b.date_to} for b in bookings]
    return {"room_id": room_id, "occupied_periods": occupied_periods}
