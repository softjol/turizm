from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.dependencies import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, VerifyEmailRequest, ResendCodeRequest, RefreshTokenRequest, GoogleAuthRequest, TokenResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import AuthService
from app.repositories.user import UserRepository
from app.dependencies.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Регистрация: имя + email + пароль. Код подтверждения отправляется на email."""
    return await AuthService.register(req, db)

@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(req: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Подтвердить email кодом после регистрации, получить access/refresh токены."""
    return await AuthService.verify_email(req.email, req.code, db)

@router.post("/resend-code")
async def resend_code(req: ResendCodeRequest, db: AsyncSession = Depends(get_db)):
    """Повторно отправить код подтверждения email."""
    await AuthService.resend_code(req.email, db)
    return {"message": "Code sent successfully"}

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Вход по email и паролю (без кода)."""
    return await AuthService.login(req.email, req.password, db)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Обновить access-токен по refresh-токену (с ротацией)."""
    return await AuthService.refresh_token(req.refresh_token, db)

@router.post("/logout")
async def logout(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Выход - отзыв refresh-токена."""
    await AuthService.logout(req.refresh_token, db)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Данные текущего авторизованного пользователя."""
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_me(
    req: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Редактирование собственного профиля (имя, телефон, email, аватар)."""
    if req.email and req.email != current_user.email:
        existing = (
            await db.execute(select(User).where(User.email == req.email))
        ).scalars().first()
        if existing is not None:
            raise HTTPException(status_code=400, detail="Email already in use")
    if req.whatsapp_phone_number is not None:
        phone = AuthService.normalize_phone(req.whatsapp_phone_number)
        req.whatsapp_phone_number = phone or None
        if phone and phone != current_user.whatsapp_phone_number:
            existing_phone = await UserRepository.get_by_phone(phone, db)
            if existing_phone is not None:
                raise HTTPException(status_code=400, detail="Phone number already in use")
    await UserRepository.update(current_user, req, db)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Вход через Google OAuth."""
    return await AuthService.google_auth(req.token, db, req.role)
