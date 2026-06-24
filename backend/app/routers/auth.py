from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.auth import RegisterRequest, RequestOtpRequest, VerifyOtpRequest, RefreshTokenRequest, GoogleAuthRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth import AuthService
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Регистрация: имя + номер WhatsApp."""
    return await AuthService.register(req, db)

@router.post("/login/request-otp")
async def request_otp(req: RequestOtpRequest, db: AsyncSession = Depends(get_db)):
    """Запросить код подтверждения, отправляется в WhatsApp."""
    await AuthService.request_otp(req.whatsapp_phone_number, db)
    return {"message": "OTP code sent successfully"}

@router.post("/login/verify-otp", response_model=TokenResponse)
async def verify_otp(req: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """Подтвердить код, получить access/refresh токены."""
    return await AuthService.verify_otp(req.whatsapp_phone_number, req.code, db)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Обновить access-токен по refresh-токену (с ротацией)."""
    return await AuthService.refresh_token(req.refresh_token, db)

@router.post("/logout")
async def logout(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Выход — отзыв refresh-токена."""
    await AuthService.logout(req.refresh_token, db)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Данные текущего авторизованного пользователя."""
    return current_user

@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Вход через Google OAuth."""
    return await AuthService.google_auth(req.token, db)
