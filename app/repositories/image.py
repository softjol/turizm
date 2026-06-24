from app.models.image import Image
from app.repositories.base import BaseRepository

class ImageRepository(BaseRepository):
    model = Image
