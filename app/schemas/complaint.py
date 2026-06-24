import datetime
from pydantic import BaseModel, Field
from app.models.complaint import ComplaintTargetType, ComplaintStatus

class ComplaintCreate(BaseModel):
    target_type: ComplaintTargetType
    target_id: int
    reason: str = Field(..., min_length=5)

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus

class ComplaintResponse(BaseModel):
    id: int
    user_id: int
    target_type: ComplaintTargetType
    target_id: int
    reason: str
    status: ComplaintStatus
    created_at: datetime.datetime

    class Config:
        from_attributes = True
