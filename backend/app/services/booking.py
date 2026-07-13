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
from app.schemas.booking import BookingCreate, MultiBookingCreate, WalkInBookingCreate

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

    @staticmethod
    def _check_total_capacity(rooms: list[Room], guests: int):
        """`guests` is the total party size for the whole booking request, checked against the
        combined capacity of every room in it (a single room for create_booking, or all rooms
        together for a multi-room/walk-in request covering one shared stay)."""
        capacity = sum(room.capacity_adults + room.capacity_children for room in rooms)
        if guests > capacity:
            raise HTTPException(
                status_code=400,
                detail=f"Selected room(s) fit up to {capacity} guests total, but {guests} were requested"
            )

    @staticmethod
    async def _fetch_rooms(room_ids: list[int], db: AsyncSession) -> list[Room]:
        """Fetch each room by id; raises 404 if any is missing.

        Rejects (rather than silently drops) duplicate room_ids so the caller always gets exactly
        as many bookings as room ids requested, or a clear error. Does NOT check availability/capacity -
        callers that must authorize the request (e.g. hotel ownership) should do so before revealing
        that via `_check_rooms_bookable`, so an unauthorized caller can't probe another hotel's occupancy.
        """
        if len(set(room_ids)) != len(room_ids):
            raise HTTPException(status_code=400, detail="Duplicate room_ids in request")

        rooms = []
        for room_id in room_ids:
            room = await RoomRepository.get_by_id_with_relations(room_id, db)
            if not room:
                raise HTTPException(status_code=404, detail=f"Room {room_id} not found")
            rooms.append(room)
        return rooms

    @classmethod
    async def _check_rooms_bookable(
        cls, rooms: list[Room], date_from: datetime.date, date_to: datetime.date, guests: int, db: AsyncSession
    ):
        """Check availability for already-fetched (and, where relevant, already-authorized) rooms,
        then validate `guests` against their combined capacity."""
        for room in rooms:
            is_available = await RoomRepository.check_availability(room.id, date_from, date_to, db)
            if not is_available:
                raise HTTPException(
                    status_code=400,
                    detail=f"Room {room.room_number} is occupied or unavailable for the selected dates"
                )
        cls._check_total_capacity(rooms, guests)

    @classmethod
    async def _load_available_rooms(
        cls, room_ids: list[int], date_from: datetime.date, date_to: datetime.date, guests: int, db: AsyncSession
    ) -> list[Room]:
        """Fetch each room, check availability and capacity; raises if any room fails a check.

        All-or-nothing: nothing is created here, so a raised exception leaves no partial state.
        """
        rooms = await cls._fetch_rooms(room_ids, db)
        await cls._check_rooms_bookable(rooms, date_from, date_to, guests, db)
        return rooms

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

        cls._check_total_capacity([room], req.guests)

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
        await db.refresh(booking)
        return booking

    @classmethod
    async def create_multi_booking(cls, user_id: int, req: MultiBookingCreate, db: AsyncSession) -> list[Booking]:
        """Book several rooms at once (e.g. a family needing 2 rooms), same dates for all."""
        if req.date_from >= req.date_to:
            raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

        rooms = await cls._load_available_rooms(req.room_ids, req.date_from, req.date_to, req.guests, db)

        if len({room.hotel_id for room in rooms}) > 1:
            raise HTTPException(status_code=400, detail="All rooms in a single booking must belong to the same hotel")

        num_nights = (req.date_to - req.date_from).days
        bookings = []
        for room in rooms:
            total_amount = Decimal(num_nights) * room.price_per_night
            deposit_amount = total_amount * Decimal("0.20")
            booking = Booking(
                user_id=user_id,
                room_id=room.id,
                date_from=req.date_from,
                date_to=req.date_to,
                guests=req.guests,
                total_amount=total_amount,
                deposit_amount=deposit_amount,
                status=BookingStatus.pending
            )
            await BookingRepository.create(booking, db)
            bookings.append(booking)

        await db.flush()

        await cls._send_notification(
            user_id=user_id,
            type_="booking_created",
            title="Бронирование создано",
            body=f"Вы успешно создали бронирование {len(bookings)} номер(ов) в отеле '{rooms[0].hotel.name}'. Ожидайте подтверждения от ресепшена.",
            db=db
        )

        notified_owners = set()
        for room in rooms:
            if room.hotel.owner_id in notified_owners:
                continue
            notified_owners.add(room.hotel.owner_id)
            await cls._send_notification(
                user_id=room.hotel.owner_id,
                type_="booking_created_reception",
                title="Новое бронирование",
                body=f"Поступил новый запрос на бронирование {len(bookings)} номер(ов) с {req.date_from} по {req.date_to}.",
                db=db
            )

        await db.commit()
        for booking in bookings:
            await db.refresh(booking)
        return bookings

    @classmethod
    async def create_walkin_booking(
        cls, hotel_id: int, receptionist_id: int, is_admin: bool, req: WalkInBookingCreate, db: AsyncSession
    ) -> list[Booking]:
        """Reception creates booking(s) for a guest who showed up without booking on the site."""
        if req.date_from >= req.date_to:
            raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

        # Fetch + authorize BEFORE checking availability, so an unauthorized caller can't use this
        # endpoint to probe another hotel's room occupancy (permission must gate everything else).
        rooms = await cls._fetch_rooms(req.room_ids, db)

        for room in rooms:
            if room.hotel_id != hotel_id:
                raise HTTPException(status_code=400, detail=f"Room {room.room_number} does not belong to this hotel")
            if not is_admin and room.hotel.owner_id != receptionist_id:
                raise HTTPException(status_code=403, detail="Permission denied: not the hotel owner/receptionist")

        await cls._check_rooms_bookable(rooms, req.date_from, req.date_to, req.guests, db)

        num_nights = (req.date_to - req.date_from).days
        bookings = []
        for room in rooms:
            total_amount = Decimal(num_nights) * room.price_per_night
            deposit_amount = total_amount * Decimal("0.20")
            booking = Booking(
                user_id=None,
                room_id=room.id,
                guest_name=req.guest_name.strip(),
                guest_phone=(req.guest_phone or "").strip() or None,
                date_from=req.date_from,
                date_to=req.date_to,
                guests=req.guests,
                total_amount=total_amount,
                deposit_amount=deposit_amount,
                status=BookingStatus.checked_in if req.check_in_now else BookingStatus.confirmed
            )
            await BookingRepository.create(booking, db)
            bookings.append(booking)

        await db.commit()
        for booking in bookings:
            await db.refresh(booking)
        return bookings

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

        # Notify user (walk-in bookings have no user_id to notify)
        if booking.user_id is not None:
            await cls._send_notification(
                user_id=booking.user_id,
                type_="booking_confirmed",
                title="Бронирование подтверждено",
                body=f"Ваше бронирование номера {booking.room.room_number} в '{booking.room.hotel.name}' успешно подтверждено ресепшеном.",
                db=db
            )

        await db.commit()
        await db.refresh(booking)
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

        # Notify user (walk-in bookings have no user_id to notify)
        if booking.user_id is not None:
            await cls._send_notification(
                user_id=booking.user_id,
                type_="booking_rejected",
                title="Бронирование отклонено",
                body=f"К сожалению, ваше бронирование номера {booking.room.room_number} в '{booking.room.hotel.name}' было отклонено ресепшеном.",
                db=db
            )

        await db.commit()
        await db.refresh(booking)
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
        elif booking.user_id is not None:
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
        await db.refresh(booking)
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
        await db.refresh(booking)
        return booking
