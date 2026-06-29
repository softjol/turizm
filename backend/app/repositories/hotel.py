import datetime
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.hotel import Hotel, HotelStatus
from app.models.room import Room, RoomStatus
from app.models.booking import Booking, BookingStatus
from app.models.amenity import Amenity
from app.models.hotel_type import HotelType
from app.repositories.base import BaseRepository

class HotelRepository(BaseRepository):
    model = Hotel

    @classmethod
    async def get_by_id_with_relations(cls, hotel_id: int, db: AsyncSession) -> Hotel | None:
        query = (
            select(cls.model)
            .where(cls.model.id == hotel_id)
            .options(
                selectinload(cls.model.owner),
                selectinload(cls.model.hotel_type),
                selectinload(cls.model.rooms),
                selectinload(cls.model.images),
                selectinload(cls.model.reviews),
                selectinload(cls.model.amenities)
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_owner_id(cls, owner_id: int, db: AsyncSession) -> list[Hotel]:
        query = (
            select(cls.model)
            .where(cls.model.owner_id == owner_id)
            .options(
                selectinload(cls.model.hotel_type),
                selectinload(cls.model.images),
                selectinload(cls.model.amenities)
            )
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def search_hotels(
        cls,
        db: AsyncSession,
        hotel_type_id: int | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        amenity_ids: list[int] | None = None,
        check_in_date: datetime.date | None = None,
        check_out_date: datetime.date | None = None,
        search_query: str | None = None,
        page: int = 1,
        limit: int = 10,
        sort_by: str | None = None
    ) -> list[Hotel]:
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        # Only approved hotels for public search
        conditions = [cls.model.status == HotelStatus.approved]

        if hotel_type_id:
            conditions.append(cls.model.hotel_type_id == hotel_type_id)

        if min_rating is not None:
            conditions.append(cls.model.rating >= min_rating)

        if search_query:
            conditions.append(
                or_(
                    cls.model.name.ilike(f"%{search_query}%"),
                    cls.model.description.ilike(f"%{search_query}%"),
                    cls.model.address.ilike(f"%{search_query}%")
                )
            )

        # Filters involving Rooms (price and availability)
        room_conditions = [Room.status == RoomStatus.available]
        if min_price is not None:
            room_conditions.append(Room.price_per_night >= min_price)
        if max_price is not None:
            room_conditions.append(Room.price_per_night <= max_price)

        if check_in_date and check_out_date:
            overlap_booking_exists = select(Booking.room_id).where(
                and_(
                    Booking.room_id == Room.id,
                    Booking.status.in_([
                        BookingStatus.pending,
                        BookingStatus.confirmed,
                        BookingStatus.checked_in
                    ]),
                    Booking.date_from < check_out_date,
                    Booking.date_to > check_in_date
                )
            ).exists()
            room_conditions.append(~overlap_booking_exists)

        stmt = select(cls.model).distinct().where(and_(*conditions))

        # Join rooms if room filters are present
        if min_price is not None or max_price is not None or (check_in_date and check_out_date):
            stmt = stmt.join(cls.model.rooms).where(and_(*room_conditions))
        else:
            # For general search, we still might want to filter only hotels with rooms
            pass

        # Filter by amenities (Logical AND for all requested amenities)
        if amenity_ids:
            for am_id in amenity_ids:
                stmt = stmt.where(cls.model.amenities.any(Amenity.id == am_id))

        # Ordering & grouping
        if sort_by == "rating":
            stmt = stmt.order_by(desc(cls.model.rating))
        elif sort_by == "price_asc":
            stmt = stmt.outerjoin(cls.model.rooms).group_by(cls.model.id).order_by(func.min(Room.price_per_night))
        elif sort_by == "price_desc":
            stmt = stmt.outerjoin(cls.model.rooms).group_by(cls.model.id).order_by(desc(func.min(Room.price_per_night)))
        else:
            stmt = stmt.order_by(desc(cls.model.rating))

        stmt = stmt.offset(offset).limit(limit)
        stmt = stmt.options(
            selectinload(cls.model.images),
            selectinload(cls.model.amenities),
            selectinload(cls.model.hotel_type),
            selectinload(cls.model.rooms),
            selectinload(cls.model.reviews)
        )

        result = await db.execute(stmt)
        hotels = list(result.scalars().all())

        # Attach card aggregates so the catalog needs only this one request.
        for hotel in hotels:
            available_prices = [
                float(r.price_per_night)
                for r in hotel.rooms
                if r.status == RoomStatus.available
            ]
            hotel.price_from = min(available_prices) if available_prices else None
            hotel.reviews_count = len(hotel.reviews)

        return hotels
