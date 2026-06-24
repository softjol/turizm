from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hotel import Hotel, HotelStatus
from app.models.image import Image
from app.models.amenity import Amenity
from app.repositories.hotel import HotelRepository
from app.repositories.image import ImageRepository
from app.repositories.amenity import AmenityRepository
from app.schemas.hotel import HotelCreate, HotelUpdate

class HotelService:

    @classmethod
    async def _check_permission(cls, hotel: Hotel, user_id: int, is_admin: bool):
        if not is_admin and hotel.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied: not the hotel owner")

    @classmethod
    async def get_hotels_by_owner(cls, owner_id: int, db: AsyncSession) -> list[Hotel]:
        return await HotelRepository.get_by_owner_id(owner_id, db)

    @classmethod
    async def create_hotel(cls, owner_id: int, req: HotelCreate, db: AsyncSession) -> Hotel:
        hotel = Hotel(
            owner_id=owner_id,
            hotel_type_id=req.hotel_type_id,
            name=req.name,
            description=req.description,
            address=req.address,
            latitude=req.latitude,
            longitude=req.longitude,
            phone=req.phone,
            whatsapp=req.whatsapp,
            email=req.email,
            check_in_time=req.check_in_time,
            check_out_time=req.check_out_time,
            status=HotelStatus.pending,
            rating=0.0
        )
        await HotelRepository.create(hotel, db)
        await db.commit()
        return hotel

    @classmethod
    async def update_hotel(cls, hotel_id: int, user_id: int, is_admin: bool, req: HotelUpdate, db: AsyncSession) -> Hotel:
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        
        await cls._check_permission(hotel, user_id, is_admin)
        
        # update fields
        updated_hotel = await HotelRepository.update(hotel, req, db)
        await db.commit()
        return updated_hotel

    @classmethod
    async def delete_hotel(cls, hotel_id: int, db: AsyncSession):
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        await HotelRepository.delete(hotel, db)
        await db.commit()

    @classmethod
    async def update_status(cls, hotel_id: int, status: HotelStatus, db: AsyncSession) -> Hotel:
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        
        hotel.status = status
        await db.commit()
        return hotel

    @classmethod
    async def set_amenities(cls, hotel_id: int, user_id: int, is_admin: bool, amenity_ids: list[int], db: AsyncSession) -> Hotel:
        hotel = await HotelRepository.get_by_id_with_relations(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        
        await cls._check_permission(hotel, user_id, is_admin)
        
        # Load amenities
        amenities = []
        for a_id in amenity_ids:
            amenity = await AmenityRepository.get_by_id(a_id, db)
            if not amenity:
                raise HTTPException(status_code=400, detail=f"Amenity with id {a_id} not found")
            amenities.append(amenity)
            
        hotel.amenities = amenities
        await db.commit()
        return hotel

    @classmethod
    async def add_image(cls, hotel_id: int, user_id: int, is_admin: bool, url: str, is_main: bool, db: AsyncSession) -> Image:
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
            
        await cls._check_permission(hotel, user_id, is_admin)

        if is_main:
            # Set other images for this hotel as not main
            stmt = select(Image).where(Image.hotel_id == hotel_id)
            res = await db.execute(stmt)
            for img in res.scalars().all():
                img.is_main = False

        image = Image(
            hotel_id=hotel_id,
            url=url,
            is_main=is_main
        )
        await ImageRepository.create(image, db)
        await db.commit()
        return image

    @classmethod
    async def delete_image(cls, hotel_id: int, image_id: int, user_id: int, is_admin: bool, db: AsyncSession):
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
            
        await cls._check_permission(hotel, user_id, is_admin)

        image = await ImageRepository.get_by_id(image_id, db)
        if not image or image.hotel_id != hotel_id:
            raise HTTPException(status_code=404, detail="Image not found for this hotel")

        await ImageRepository.delete(image, db)
        await db.commit()
