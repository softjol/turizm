from typing import Literal
from pydantic import BaseModel, Field, field_validator

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., description="Email address, e.g. user@example.com")
    password: str = Field(..., min_length=6, max_length=100)
    avatar_url: str | None = None
    language: str | None = "ru"
    role: Literal["user", "reception"] = "user"

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        import re
        v = v.strip().lower()
        if not re.match(EMAIL_PATTERN, v):
            raise ValueError("Invalid email address")
        return v

class LoginRequest(BaseModel):
    email: str = Field(..., description="Email address, e.g. user@example.com")
    password: str = Field(..., min_length=1)

class VerifyEmailRequest(BaseModel):
    email: str
    code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")

class ResendCodeRequest(BaseModel):
    email: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class GoogleAuthRequest(BaseModel):
    token: str = Field(..., description="Google ID Token or Access Token")
    role: Literal["user", "reception"] = "user"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
