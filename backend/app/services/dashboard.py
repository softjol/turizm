import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.dashboard import DashboardRepository
from app.repositories.hotel import HotelRepository
from app.schemas.dashboard import AdminDashboardResponse, ReceptionDashboardResponse, ReceptionFinanceResponse, PopularHotelItem
from app.schemas.booking import BookingResponse
from app.models.booking import Booking

class DashboardService:

    @classmethod
    async def get_admin_dashboard(cls, db: AsyncSession, start_date: datetime.date | None = None, end_date: datetime.date | None = None) -> AdminDashboardResponse:
        metrics = await DashboardRepository.get_admin_metrics(db, start_date, end_date)
        
        # Получение популярных отелей (мокируем или берем топ-5)
        # В реальном проекте тут будет агрегация по отзывам и броням
        # Для MVP вернем пустой список
        popular_hotels = []

        return AdminDashboardResponse(
            users_count=metrics["new_users"],
            hotels_count=0, # TODO: implement count in dashboard metrics
            rooms_count=0,
            bookings_count=metrics["total_bookings"],
            popular_hotels=popular_hotels,
            average_rating=0.0,
            total_revenue=metrics["total_revenue"]
        )

    @classmethod
    async def get_reception_dashboard(cls, db: AsyncSession, hotel_id: int, target_date: datetime.date) -> ReceptionDashboardResponse:
        metrics = await DashboardRepository.get_receptionist_metrics(db, hotel_id, target_date)
        
        # Получение последних броней для отеля
        from app.repositories.booking import BookingRepository
        bookings = await BookingRepository.get_bookings(db, hotel_id=hotel_id, limit=5)
        
        recent_bookings = [BookingResponse.model_validate(b) for b in bookings]
        
        return ReceptionDashboardResponse(
            total_rooms=metrics["total_rooms"],
            free_rooms=metrics["total_rooms"] - metrics["occupied_rooms"],
            occupied_rooms=metrics["occupied_rooms"],
            bookings_count=metrics["check_ins_today"], # Пример
            guests_count=0,
            average_rating=0.0,
            recent_bookings=recent_bookings
        )

    @classmethod
    async def get_reception_finance(cls, db: AsyncSession, hotel_id: int) -> ReceptionFinanceResponse:
        # Мок финансового отчета для MVP
        return ReceptionFinanceResponse(
            revenue_today=0.0,
            revenue_week=0.0,
            revenue_month=0.0,
            bookings_count=0,
            deposits_total=0.0
        )
