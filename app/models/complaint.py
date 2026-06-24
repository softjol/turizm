import datetime
import enum
from sqlalchemy import DateTime, func, ForeignKey, Text, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class ComplaintTargetType(enum.Enum):
    hotel = "hotel"
    room = "room"
    user = "user"
    booking = "booking"
    review = "review"

class ComplaintStatus(enum.Enum):
    new = "new"
    in_review = "in_review"
    resolved = "resolved"
    rejected = "rejected"

class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type: Mapped[ComplaintTargetType] = mapped_column(
        Enum(ComplaintTargetType, native_enum=False, length=20), nullable=False
    )
    target_id: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, native_enum=False, length=20),
        default=ComplaintStatus.new,
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User", back_populates="complaints")
