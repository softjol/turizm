from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.room import Room, RoomStatus
from app.models.hotel import Hotel
from app.models.image import Image
from app.models.amenity import Amenity
from app.repositories.room import RoomRepository
from app.repositories.hotel import HotelRepository
from app.repositories.image import ImageRepository
from app.repositories.amenity import AmenityRepository
from app.schemas.room import RoomCreate, RoomUpdate

class RoomService:

    @classmethod
    async def _check_hotel_ownership(cls, hotel_id: int, user_id: int, is_admin: bool, db: AsyncSession):
        hotel = await HotelRepository.get_by_id(hotel_id, db)
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        if not is_admin and hotel.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Permission denied: not the hotel owner")

    @classmethod
    async def _check_room_ownership(cls, room: Room, user_id: int, is_admin: bool, db: AsyncSession):
        await cls._check_hotel_ownership(room.hotel_id, user_id, is_admin, db)

    @classmethod
    async def create_room(cls, hotel_id: int, user_id: int, is_admin: bool, req: RoomCreate, db: AsyncSession) -> Room:
        await cls._check_hotel_ownership(hotel_id, user_id, is_admin, db)
        
        room = Room(
            hotel_id=hotel_id,
            room_number=req.room_number,
            name=req.name,
            type=req.type,
            price_per_night=req.price_per_night,
            capacity_adults=req.capacity_adults,
            capacity_children=req.capacity_children,
            description=req.description,
            status=req.status
        )
        await RoomRepository.create(room, db)
        await db.commit()
        return room

    @classmethod
    async def update_room(cls, room_id: int, user_id: int, is_admin: bool, req: RoomUpdate, db: AsyncSession) -> Room:
        room = await RoomRepository.get_by_id(room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        await cls._check_room_ownership(room, user_id, is_admin, db)
        
        updated_room = await RoomRepository.update(room, req, db)
        await db.commit()
        return updated_room

    @classmethod
    async def delete_room(cls, room_id: int, user_id: int, is_admin: bool, db: AsyncSession):
        room = await RoomRepository.get_by_id(room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        await cls._check_room_ownership(room, user_id, is_admin, db)
        
        await RoomRepository.delete(room, db)
        await db.commit()

    @classmethod
    async def set_amenities(cls, room_id: int, user_id: int, is_admin: bool, amenity_ids: list[int], db: AsyncSession) -> Room:
        room = await RoomRepository.get_by_id_with_relations(room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        await cls._check_room_ownership(room, user_id, is_admin, db)

        amenities = []
        for a_id in amenity_ids:
            amenity = await AmenityRepository.get_by_id(a_id, db)
            if not amenity:
                raise HTTPException(status_code=400, detail=f"Amenity with id {a_id} not found")
            amenities.append(amenity)
            
        room.amenities = amenities
        await db.commit()
        return room

    @classmethod
    async def update_availability(cls, room_id: int, user_id: int, is_admin: bool, status: RoomStatus, db: AsyncSession) -> Room:
        room = await RoomRepository.get_by_id(room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        await cls._check_room_ownership(room, user_id, is_admin, db)

        room.status = status
        await db.commit()
        return room

    @classmethod
    async def add_image(cls, room_id: int, user_id: int, is_admin: bool, url: str, is_main: bool, db: AsyncSession) -> Image:
        room = await RoomRepository.get_by_id(room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        await cls._check_room_ownership(room, user_id, is_admin, db)

        if is_main:
            stmt = select(Image).where(Image.room_id == room_id)
            res = await db.execute(stmt)
            for img in res.scalars().all():
                img.is_main = False

        image = Image(
            room_id=room_id,
            url=url,
            is_main=is_main
        )
        await ImageRepository.create(image, db)
        await db.commit()
        return image

    @classmethod
    async def delete_image(cls, room_id: int, image_id: int, user_id: int, is_admin: bool, db: AsyncSession):
        room = await RoomRepository.get_by_id(room_id, db)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
            
        await cls._check_room_ownership(room, user_id, is_admin, db)

        image = await ImageRepository.get_by_id(image_id, db)
        if not image or image.room_id != room_id:
            raise HTTPException(status_code=404, detail="Image not found for this room")

        await ImageRepository.delete(image, db)
        await db.commit()
