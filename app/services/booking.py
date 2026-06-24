import datetime
from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.room import Room, RoomStatus
from app.models.notification import Notification
from app.repositories.booking import BookingRepository
from app.repositories.room import RoomRepository
from app.repositories.notification import NotificationRepository
from app.schemas.booking import BookingCreate

class BookingService:

    @staticmethod
    async def _send_notification(user_id: int, type_: str, title: str, body: str, db: AsyncSession):
        notif = Notification(
            user_id=user_id,
            type=type_,
            title=title,
            body=body,
            is_read=False
        )
        await NotificationRepository.create(notif, db)

    @classmethod
    async def create_booking(cls, user_id: int, req: BookingCreate, db: AsyncSession) -> Booking:
        if req.date_from >= req.date_to:
            raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

        # Check room availability
        room = await RoomRepository.get_by_id_with_relations(req.room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        is_available = await RoomRepository.check_availability(req.room_id, req.date_from, req.date_to, db)
        if not is_available:
            raise HTTPException(status_code=400, detail="Room is occupied or unavailable for the selected dates")

        # Calculations
        num_nights = (req.date_to - req.date_from).days
        total_amount = Decimal(num_nights) * room.price_per_night
        deposit_amount = total_amount * Decimal("0.20")  # 20% deposit requirement

        booking = Booking(
            user_id=user_id,
            room_id=req.room_id,
            date_from=req.date_from,
            date_to=req.date_to,
            guests=req.guests,
            total_amount=total_amount,
            deposit_amount=deposit_amount,
            status=BookingStatus.pending
        )

        await BookingRepository.create(booking, db)
        await db.flush() # get booking.id

        # Send notifications
        # User notification
        await cls._send_notification(
            user_id=user_id,
            type_="booking_created",
            title="Бронирование создано",
            body=f"Вы успешно создали бронирование номера в отели '{room.hotel.name}'. Ожидайте подтверждения от ресепшена.",
            db=db
        )

        # Receptionist notification (hotel owner)
        await cls._send_notification(
            user_id=room.hotel.owner_id,
            type_="booking_created_reception",
            title="Новое бронирование",
            body=f"Поступил новый запрос на бронирование номера {room.room_number} с {req.date_from} по {req.date_to}.",
            db=db
        )

        await db.commit()
        return booking

    @classmethod
    async def confirm_booking(cls, booking_id: int, receptionist_id: int, is_admin: bool, db: AsyncSession) -> Booking:
        booking = await BookingRepository.get_by_id_with_relations(booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if not is_admin and booking.room.hotel.owner_id != receptionist_id:
            raise HTTPException(status_code=403, detail="Permission denied: not the hotel owner/receptionist")

        if booking.status != BookingStatus.pending:
            raise HTTPException(status_code=400, detail=f"Cannot confirm booking in status {booking.status.value}")

        booking.status = BookingStatus.confirmed

        # Notify user
        await cls._send_notification(
            user_id=booking.user_id,
            type_="booking_confirmed",
            title="Бронирование подтверждено",
            body=f"Ваше бронирование номера {booking.room.room_number} в '{booking.room.hotel.name}' успешно подтверждено ресепшеном.",
            db=db
        )

        await db.commit()
        return booking

    @classmethod
    async def reject_booking(cls, booking_id: int, receptionist_id: int, is_admin: bool, db: AsyncSession) -> Booking:
        booking = await BookingRepository.get_by_id_with_relations(booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if not is_admin and booking.room.hotel.owner_id != receptionist_id:
            raise HTTPException(status_code=403, detail="Permission denied")

        if booking.status != BookingStatus.pending:
            raise HTTPException(status_code=400, detail=f"Cannot reject booking in status {booking.status.value}")

        booking.status = BookingStatus.rejected

        # Notify user
        await cls._send_notification(
            user_id=booking.user_id,
            type_="booking_rejected",
            title="Бронирование отклонено",
            body=f"К сожалению, ваше бронирование номера {booking.room.room_number} в '{booking.room.hotel.name}' было отклонено ресепшеном.",
            db=db
        )

        await db.commit()
        return booking

    @classmethod
    async def cancel_booking(cls, booking_id: int, user_id: int, is_admin: bool, db: AsyncSession) -> Booking:
        booking = await BookingRepository.get_by_id_with_relations(booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Allow user who booked, hotel owner, or admin to cancel
        is_user = booking.user_id == user_id
        is_owner = booking.room.hotel.owner_id == user_id
        
        if not (is_admin or is_user or is_owner):
            raise HTTPException(status_code=403, detail="Permission denied")

        if booking.status in [BookingStatus.cancelled, BookingStatus.completed, BookingStatus.checked_out]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel booking in status {booking.status.value}")

        old_status = booking.status
        booking.status = BookingStatus.cancelled

        # Notify user if receptionist/admin cancelled, or notify receptionist if user cancelled
        if is_user:
            await cls._send_notification(
                user_id=booking.room.hotel.owner_id,
                type_="booking_cancelled",
                title="Бронирование отменено гостем",
                body=f"Бронирование номера {booking.room.room_number} с {booking.date_from} по {booking.date_to} было отменено гостем.",
                db=db
            )
        else:
            await cls._send_notification(
                user_id=booking.user_id,
                type_="booking_cancelled",
                title="Бронирование отменено администрацией",
                body=f"Ваше бронирование номера {booking.room.room_number} в '{booking.room.hotel.name}' было отменено администрацией.",
                db=db
            )

        await db.commit()
        # `updated_at` (onupdate=func.now()) is expired after the UPDATE and must be
        # reloaded from the DB; otherwise serialization triggers lazy IO off-greenlet.
        await db.refresh(booking)
        return booking

    @classmethod
    async def check_in_booking(cls, booking_id: int, receptionist_id: int, is_admin: bool, db: AsyncSession) -> Booking:
        booking = await BookingRepository.get_by_id_with_relations(booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if not is_admin and booking.room.hotel.owner_id != receptionist_id:
            raise HTTPException(status_code=403, detail="Permission denied")

        if booking.status != BookingStatus.confirmed:
            raise HTTPException(status_code=400, detail="Cannot check in without confirmation")

        booking.status = BookingStatus.checked_in
        await db.commit()
        return booking

    @classmethod
    async def check_out_booking(cls, booking_id: int, receptionist_id: int, is_admin: bool, db: AsyncSession) -> Booking:
        booking = await BookingRepository.get_by_id_with_relations(booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if not is_admin and booking.room.hotel.owner_id != receptionist_id:
            raise HTTPException(status_code=403, detail="Permission denied")

        if booking.status != BookingStatus.checked_in:
            raise HTTPException(status_code=400, detail="Cannot check out a guest that is not checked in")

        # Transition directly to completed to allow reviews
        booking.status = BookingStatus.completed
        await db.commit()
        return booking
