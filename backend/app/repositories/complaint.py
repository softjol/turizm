from app.models.complaint import Complaint
from app.repositories.base import BaseRepository

class ComplaintRepository(BaseRepository):
    model = Complaint
