import datetime
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
