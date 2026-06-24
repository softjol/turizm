from app.models.hotel_type import HotelType
from app.repositories.base import BaseRepository

class HotelTypeRepository(BaseRepository):
    model = HotelType
