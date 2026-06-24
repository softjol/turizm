import datetime
from pydantic import BaseModel, Field
from app.models.user import Role

class UserResponse(BaseModel):
    id: int
    name: str
    whatsapp_phone_number: str | None = None
    email: str | None = None
    google_id: str | None = None
    role: Role
    is_active: bool
    avatar_url: str | None = None
    language: str | None = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=50)
    whatsapp_phone_number: str | None = None
    email: str | None = None
    avatar_url: str | None = None
    language: str | None = None

class UserRoleUpdate(BaseModel):
    role: Role

class UserBlockUpdate(BaseModel):
    is_active: bool
