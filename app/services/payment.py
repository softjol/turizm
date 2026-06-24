from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment, PaymentStatus
from app.repositories.payment import PaymentRepository
from app.repositories.booking import BookingRepository
from app.schemas.payment import PaymentCreate, PaymentWebhook

class PaymentService:

    @classmethod
    async def create_payment(cls, booking_id: int, user_id: int, req: PaymentCreate, db: AsyncSession) -> Payment:
        booking = await BookingRepository.get_by_id(booking_id, db)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        if booking.user_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied: not the booking owner")

        payment = Payment(
            booking_id=booking_id,
            amount=req.amount,
            status=PaymentStatus.pending,
            payment_method=req.payment_method
        )
        await PaymentRepository.create(payment, db)
        await db.commit()
        return payment

    @classmethod
    async def process_webhook(cls, payload: PaymentWebhook, db: AsyncSession) -> Payment:
        # Check if external_payment_id is already processed
        payment = await PaymentRepository.get_by_external_id(payload.external_payment_id, db)
        
        if payment is None:
            # Look up if a pending payment exists for this booking that we can link
            stmt = select(Payment).where(
                Payment.booking_id == payload.booking_id,
                Payment.status == PaymentStatus.pending
            ).limit(1)
            res = await db.execute(stmt)
            payment = res.scalar_one_or_none()

            if payment is None:
                # Create a new payment record from scratch
                payment = Payment(
                    booking_id=payload.booking_id,
                    amount=payload.amount,
                    status=PaymentStatus.pending,
                    payment_method=payload.payment_method,
                    external_payment_id=payload.external_payment_id
                )
                await PaymentRepository.create(payment, db)
            else:
                # Link external payment ID to existing pending payment
                payment.external_payment_id = payload.external_payment_id
                payment.payment_method = payload.payment_method
                payment.amount = payload.amount

        # Update status
        if payload.status == "paid":
            payment.status = PaymentStatus.paid
        elif payload.status == "failed":
            payment.status = PaymentStatus.failed
        else:
            payment.status = PaymentStatus.pending

        await db.commit()
        return payment
