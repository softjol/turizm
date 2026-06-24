import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User, Role
from app.models.room import Room
from app.models.hotel import Hotel

class DashboardRepository:
    """
    Репозиторий для получения агрегированных данных для дашбордов (Администратор и Ресепшн).
    """

    @staticmethod
    async def get_admin_metrics(
        session: AsyncSession,
        start_date: datetime.date | None = None,
        end_date: datetime.date | None = None
    ) -> dict:
        """
        Получение метрик для администратора платформы.
        """
        # Базовые запросы
        revenue_query = select(func.sum(Payment.amount)).where(Payment.status == PaymentStatus.paid)
        bookings_query = select(func.count(Booking.id)).where(
            Booking.status.in_([
                BookingStatus.confirmed, BookingStatus.checked_in, BookingStatus.checked_out, BookingStatus.completed
            ])
        )
        users_query = select(func.count(User.id)).where(User.role == Role.user)

        if start_date:
            revenue_query = revenue_query.where(func.date(Payment.created_at) >= start_date)
            bookings_query = bookings_query.where(func.date(Booking.created_at) >= start_date)
            users_query = users_query.where(func.date(User.created_at) >= start_date)
        if end_date:
            revenue_query = revenue_query.where(func.date(Payment.created_at) <= end_date)
            bookings_query = bookings_query.where(func.date(Booking.created_at) <= end_date)
            users_query = users_query.where(func.date(User.created_at) <= end_date)

        total_revenue = await session.scalar(revenue_query)
        total_bookings = await session.scalar(bookings_query)
        new_users = await session.scalar(users_query)

        return {
            "total_revenue": total_revenue or 0.0,
            "total_bookings": total_bookings or 0,
            "new_users": new_users or 0
        }

    @staticmethod
    async def get_receptionist_metrics(
        session: AsyncSession,
        hotel_id: int,
        target_date: datetime.date
    ) -> dict:
        """
        Получение метрик для ресепшена конкретного отеля на заданную дату.
        """
        # Заезды на target_date
        check_ins_query = select(func.count(Booking.id)).join(Room).where(
            Room.hotel_id == hotel_id,
            Booking.date_from == target_date,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.checked_in])
        )

        # Выезды на target_date
        check_outs_query = select(func.count(Booking.id)).join(Room).where(
            Room.hotel_id == hotel_id,
            Booking.date_to == target_date,
            Booking.status.in_([BookingStatus.checked_in, BookingStatus.checked_out, BookingStatus.completed])
        )

        # Общее количество комнат в отеле
        total_rooms_query = select(func.count(Room.id)).where(Room.hotel_id == hotel_id)

        # Занятые комнаты на target_date
        occupied_rooms_query = select(func.count(Booking.id)).join(Room).where(
            Room.hotel_id == hotel_id,
            Booking.date_from <= target_date,
            Booking.date_to > target_date,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.checked_in])
        )

        check_ins = await session.scalar(check_ins_query)
        check_outs = await session.scalar(check_outs_query)
        total_rooms = await session.scalar(total_rooms_query)
        occupied_rooms = await session.scalar(occupied_rooms_query)

        occupancy_rate = 0
        if total_rooms and total_rooms > 0:
            occupancy_rate = round((occupied_rooms or 0) / total_rooms * 100, 2)

        return {
            "check_ins_today": check_ins or 0,
            "check_outs_today": check_outs or 0,
            "total_rooms": total_rooms or 0,
            "occupied_rooms": occupied_rooms or 0,
            "occupancy_rate_percent": occupancy_rate
        }
