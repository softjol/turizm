import datetime

from sqlalchemy import Enum, DateTime, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
import enum


class Role(enum.Enum):
    admin = "admin"
    reception = "reception"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(unique=True, nullable=False, index=True)
    whatsapp_phone_number: Mapped[str | None] = mapped_column(String(25), unique=True,
                                                              index=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    role: Mapped[Role] = mapped_column(
        Enum(Role, native_enum=False, length=15), nullable=False, default=Role.user
    )
    is_active: Mapped[bool] = mapped_column(default=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    hotels = relationship("Hotel", back_populates="owner", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")