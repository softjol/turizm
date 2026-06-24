import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.hotel import HotelResponse
from app.schemas.room import RoomResponse
from app.schemas.review import ReviewResponse
from app.repositories.hotel import HotelRepository
from app.repositories.room import RoomRepository
from app.repositories.review import ReviewRepository

router = APIRouter(prefix="/hotels", tags=["Hotels (Public)"])

@router.get("", response_model=list[HotelResponse])
async def search_hotels(
    hotel_type_id: int | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    min_rating: float | None = Query(None),
    amenity_ids: list[int] | None = Query(None),
    check_in_date: datetime.date | None = Query(None),
    check_out_date: datetime.date | None = Query(None),
    search_query: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Поиск/список гостиниц: фильтры по типу, цене, рейтингу, удобствам, доступности на даты, тексту; пагинация."""
    hotels = await HotelRepository.search_hotels(
        db=db,
        hotel_type_id=hotel_type_id,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        amenity_ids=amenity_ids,
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        search_query=search_query,
        page=page,
        limit=limit
    )
    return hotels

@router.get("/{hotel_id}", response_model=HotelResponse)
async def get_hotel(hotel_id: int, db: AsyncSession = Depends(get_db)):
    """Детальная информация о гостинице."""
    hotel = await HotelRepository.get_by_id_with_relations(hotel_id, db)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

@router.get("/{hotel_id}/rooms", response_model=list[RoomResponse])
async def get_hotel_rooms(hotel_id: int, db: AsyncSession = Depends(get_db)):
    """Список номеров гостиницы."""
    hotel = await HotelRepository.get_by_id_with_relations(hotel_id, db)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return await RoomRepository.get_by_hotel_id(hotel_id, db)

@router.get("/{hotel_id}/reviews", response_model=list[ReviewResponse])
async def get_hotel_reviews(hotel_id: int, db: AsyncSession = Depends(get_db)):
    """Список отзывов по гостинице."""
    return await ReviewRepository.get_by_hotel_id(hotel_id, db)
