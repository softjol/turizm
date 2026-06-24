from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.models.booking import BookingStatus
from app.repositories.review import ReviewRepository
from app.repositories.booking import BookingRepository
from app.repositories.hotel import HotelRepository
from app.schemas.review import ReviewCreate, ReviewUpdate

class ReviewService:

    @classmethod
    async def _update_hotel_rating(cls, hotel_id: int, db: AsyncSession):
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if hotel:
            count, avg_rating = await ReviewRepository.get_hotel_rating_metrics(hotel_id, db)
            hotel.rating = avg_rating
            await db.flush()

    @classmethod
    async def create_review(cls, user_id: int, req: ReviewCreate, db: AsyncSession) -> Review:
        booking = await BookingRepository.get_by_id_with_relations(req.booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if booking.user_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied: not your booking")

        if booking.status != BookingStatus.completed:
            raise HTTPException(status_code=400, detail="Cannot review a booking that is not completed")

        # Check unique booking_id for review
        existing = await ReviewRepository.get_by_booking_id(req.booking_id, db)
        if existing:
            raise HTTPException(status_code=400, detail="Review already exists for this booking")

        review = Review(
            hotel_id=booking.room.hotel_id,
            user_id=user_id,
            booking_id=req.booking_id,
            rating=req.rating,
            comment=req.comment
        )
        await ReviewRepository.create(review, db)
        await db.flush()
        
        # Recalculate average rating
        await cls._update_hotel_rating(booking.room.hotel_id, db)
        await db.commit()
        return review

    @classmethod
    async def update_review(cls, review_id: int, user_id: int, req: ReviewUpdate, db: AsyncSession) -> Review:
        review = await ReviewRepository.get_by_id(review_id, db)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        if review.user_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied: not the author")

        updated_review = await ReviewRepository.update(review, req, db)
        await db.flush()

        await cls._update_hotel_rating(review.hotel_id, db)
        await db.commit()
        return updated_review

    @classmethod
    async def delete_review(cls, review_id: int, user_id: int, is_admin: bool, db: AsyncSession):
        review = await ReviewRepository.get_by_id(review_id, db)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        if not is_admin and review.user_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied")

        hotel_id = review.hotel_id
        await ReviewRepository.delete(review, db)
        await db.flush()

        await cls._update_hotel_rating(hotel_id, db)
        await db.commit()

    @classmethod
    async def reply_review(cls, review_id: int, user_id: int, is_admin: bool, reply: str, db: AsyncSession) -> Review:
        review = await ReviewRepository.get_by_id_with_relations(review_id, db)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # Load hotel to check owner
        hotel = await HotelRepository.get_by_id(review.hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")

        if not is_admin and hotel.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied: not the hotel owner")

        review.reply = reply
        await db.commit()
        return review
