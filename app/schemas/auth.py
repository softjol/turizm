from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    whatsapp_phone_number: str = Field(..., description="WhatsApp number in international format, e.g. +996555123456")
    avatar_url: str | None = None
    language: str | None = "ru"

class RequestOtpRequest(BaseModel):
    whatsapp_phone_number: str = Field(..., description="WhatsApp number in international format, e.g. +996555123456")

class VerifyOtpRequest(BaseModel):
    whatsapp_phone_number: str
    code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class GoogleAuthRequest(BaseModel):
    token: str = Field(..., description="Google ID Token or Access Token")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
