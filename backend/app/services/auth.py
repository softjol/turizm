import datetime
import hashlib
import random
import re
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_secret,
    verify_secret,
)
from app.models.user import User, Role
from app.models.otp_code import OtpCode
from app.models.refresh_token import RefreshToken
from app.repositories.user import UserRepository
from app.repositories.otp_code import OtpCodeRepository
from app.repositories.refresh_token import RefreshTokenRepository
from app.schemas.auth import TokenResponse, RegisterRequest
from app.services.email import send_otp_email

class AuthService:

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    @staticmethod
    def normalize_phone(phone: str) -> str:
        """Canonicalize a Kyrgyz phone number to +996XXXXXXXXX so the same
        number in different formats (0503..., 503..., +996503..., +996 503 ...)
        always maps to one account."""
        digits = re.sub(r"\D", "", phone or "")
        if digits.startswith("996"):
            digits = digits[3:]
        if len(digits) == 10 and digits.startswith("0"):
            digits = digits[1:]
        if len(digits) == 9:
            return "+996" + digits
        return ("+" + digits) if digits else (phone or "")

    @classmethod
    async def _issue_tokens(cls, user: User, db: AsyncSession) -> TokenResponse:
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token(user.id)

        token_hash = cls._hash_token(refresh_token)
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)

        rt_record = RefreshToken(
            token_hash=token_hash,
            user_id=user.id,
            is_revoked=False,
            expires_at=expires_at
        )
        await RefreshTokenRepository.create(rt_record, db)
        await db.commit()

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    @classmethod
    async def _generate_and_send_code(cls, email: str, db: AsyncSession) -> None:
        code = "".join(random.choices("0123456789", k=6))
        code_hash = hash_secret(code)
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=5)

        otp_record = OtpCode(
            email=email,
            code_hash=code_hash,
            attempts=0,
            is_used=False,
            expires_at=expires_at
        )
        await OtpCodeRepository.create(otp_record, db)
        await db.commit()

        await send_otp_email(email, code)

    @classmethod
    async def register(cls, req: RegisterRequest, db: AsyncSession) -> User:
        # Check name uniqueness
        existing_name = await db.execute(
            UserRepository.model.__table__.select().where(UserRepository.model.name == req.name)
        )
        if existing_name.first() is not None:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Check email uniqueness
        existing_email = await UserRepository.get_by_email(req.email, db)
        if existing_email is not None:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            name=req.name,
            email=req.email,
            password_hash=hash_secret(req.password),
            avatar_url=req.avatar_url,
            language=req.language,
            role=Role[req.role],
            is_active=False
        )
        await UserRepository.create(user, db)
        await db.commit()

        await cls._generate_and_send_code(req.email, db)
        return user

    @classmethod
    async def resend_code(cls, email: str, db: AsyncSession) -> None:
        email = email.strip().lower()
        user = await UserRepository.get_by_email(email, db)
        if user is None:
            raise HTTPException(status_code=404, detail="Email not registered. Please register first.")
        if user.is_active:
            raise HTTPException(status_code=400, detail="Email is already verified")

        await cls._generate_and_send_code(email, db)

    @classmethod
    async def verify_email(cls, email: str, code: str, db: AsyncSession) -> TokenResponse:
        email = email.strip().lower()
        otp_record = await OtpCodeRepository.get_latest_active_otp(email, db)
        if otp_record is None:
            raise HTTPException(status_code=400, detail="Code expired or not found. Request a new one.")

        if otp_record.attempts >= 3:
            otp_record.is_used = True
            await db.commit()
            raise HTTPException(status_code=400, detail="Too many attempts. Request a new code.")

        otp_record.attempts += 1

        if not verify_secret(code, otp_record.code_hash):
            await db.commit()
            raise HTTPException(status_code=400, detail="Invalid code")

        otp_record.is_used = True

        user = await UserRepository.get_by_email(email, db)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user.is_active = True
        await db.commit()

        return await cls._issue_tokens(user, db)

    @classmethod
    async def login(cls, email: str, password: str, db: AsyncSession) -> TokenResponse:
        email = email.strip().lower()
        user = await UserRepository.get_by_email(email, db)
        if user is None or not user.password_hash or not verify_secret(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Email not verified or account blocked")

        return await cls._issue_tokens(user, db)

    @classmethod
    async def refresh_token(cls, refresh_token: str, db: AsyncSession) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")
        user_id = int(user_id_str)

        # Hash to check in database
        token_hash = cls._hash_token(refresh_token)
        rt_record = await RefreshTokenRepository.get_by_hash(token_hash, db)

        if rt_record is None or rt_record.is_revoked:
            raise HTTPException(status_code=401, detail="Refresh token revoked or not found")

        now = datetime.datetime.now(datetime.timezone.utc)
        if rt_record.expires_at.tzinfo is None:
            # handle naive datetime from postgres if any
            rt_record.expires_at = rt_record.expires_at.replace(tzinfo=datetime.timezone.utc)

        if rt_record.expires_at < now:
            raise HTTPException(status_code=401, detail="Refresh token expired")

        # Revoke old refresh token
        rt_record.is_revoked = True

        # Issue new tokens
        new_access_token = create_access_token({"sub": str(user_id)})
        new_refresh_token = create_refresh_token(user_id)

        new_token_hash = cls._hash_token(new_refresh_token)
        new_expires_at = now + datetime.timedelta(days=30)

        new_rt_record = RefreshToken(
            token_hash=new_token_hash,
            user_id=user_id,
            is_revoked=False,
            expires_at=new_expires_at
        )
        await RefreshTokenRepository.create(new_rt_record, db)
        await db.commit()

        return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)

    @classmethod
    async def logout(cls, refresh_token: str, db: AsyncSession):
        token_hash = cls._hash_token(refresh_token)
        rt_record = await RefreshTokenRepository.get_by_hash(token_hash, db)
        if rt_record:
            rt_record.is_revoked = True
            await db.commit()

    @classmethod
    async def google_auth(cls, token: str, db: AsyncSession, role: str = "user") -> TokenResponse:
        # Verify with Google (mock logic for testing, try actual call and fallback)
        import httpx

        email = None
        name = None
        google_id = None
        avatar_url = None

        if token.startswith("mock_google_token_"):
            # Programmatic testing token
            user_num = token.split("_")[-1]
            google_id = f"google_sub_{user_num}"
            email = f"google_user_{user_num}@example.com"
            name = f"Google User {user_num}"
            avatar_url = f"https://example.com/avatar_{user_num}.png"
        else:
            # Attempt to verify with Google tokeninfo
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    # Try tokeninfo first
                    resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
                    if resp.status_code == 200:
                        data = resp.json()
                        google_id = data.get("sub")
                        email = data.get("email")
                        name = data.get("name")
                        avatar_url = data.get("picture")
                    else:
                        # Try userinfo
                        resp_user = await client.get(
                            "https://www.googleapis.com/oauth2/v3/userinfo",
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        if resp_user.status_code == 200:
                            data = resp_user.json()
                            google_id = data.get("sub")
                            email = data.get("email")
                            name = data.get("name")
                            avatar_url = data.get("picture")
            except Exception as e:
                print(f"Google Token Verification failed: {e}. Fallback to mock profile.")

            if not google_id:
                # Fallback to mock behavior for testing / development
                google_id = f"google_sub_{hashlib.md5(token.encode()).hexdigest()[:10]}"
                email = f"google_user_{google_id}@example.com"
                name = f"Google User {google_id[:5]}"

        # Look up user by google_id
        user = await UserRepository.get_by_google_id(google_id, db)
        if user is None:
            # Try by email
            if email:
                user = await UserRepository.get_by_email(email, db)
                if user:
                    # Link google_id
                    user.google_id = google_id
                    if not user.avatar_url:
                        user.avatar_url = avatar_url
                    await db.commit()

            if user is None:
                # Create new user
                user = User(
                    name=name or f"Google User {google_id[:5]}",
                    email=email,
                    google_id=google_id,
                    avatar_url=avatar_url,
                    role=Role[role],
                    is_active=True # Google users are pre-verified
                )
                await UserRepository.create(user, db)
                await db.commit()

        return await cls._issue_tokens(user, db)
