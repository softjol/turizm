from app.models.amenity import Amenity
from app.repositories.base import BaseRepository

class AmenityRepository(BaseRepository):
    model = Amenity
