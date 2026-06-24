from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment import PaymentService
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Payments (User)"])

@router.post("/bookings/{booking_id}/payments", response_model=PaymentResponse)
async def create_payment(
    booking_id: int,
    req: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Внести оплату/задаток по бронированию."""
    return await PaymentService.create_payment(booking_id, current_user.id, req, db)

@router.get("/bookings/{booking_id}/payments", response_model=list[PaymentResponse])
async def get_booking_payments(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список платежей по бронированию."""
    from app.models.user import Role
    is_admin = (current_user.role == Role.admin)
    return await PaymentService.get_booking_payments(booking_id, current_user.id, is_admin, db)

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Детальная информация о платеже."""
    from app.models.user import Role
    is_admin = (current_user.role == Role.admin)
    return await PaymentService.get_payment(payment_id, current_user.id, is_admin, db)

@router.post("/payments/webhook")
async def payment_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Callback платёжного провайдера (подтверждение оплаты)."""
    # Mock webhook implementation
    payload = await request.json()
    external_id = payload.get("external_payment_id")
    status = payload.get("status") # e.g. "paid", "failed"
    
    if not external_id or not status:
        raise HTTPException(status_code=400, detail="Invalid payload")
        
    await PaymentService.process_webhook(external_id, status, db)
    return {"message": "Webhook processed successfully"}
