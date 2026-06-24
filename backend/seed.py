"""Dev seed script: populates hotel types, amenities, hotels, rooms and images
so the public API returns data to develop/test the web client against.

Idempotent-ish: clears hotels/rooms/images/types/amenities and re-inserts.
Run:  ./.venv/bin/python seed.py
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.user import User, Role
from app.models.hotel_type import HotelType
from app.models.amenity import Amenity
from app.models.hotel import Hotel, HotelStatus
from app.models.room import Room, RoomType, RoomStatus
from app.models.image import Image


def img(photo_id: str, w: int = 1200, h: int = 800) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={w}&h={h}&q=80"


def main() -> None:
    engine = create_engine(settings.sqlalchemy_url)
    with Session(engine) as db:
        # Wipe existing catalog data (respect FKs via TRUNCATE CASCADE).
        db.execute(text(
            "TRUNCATE images, room_amenities, hotel_amenities, rooms, hotels, "
            "amenities, hotel_types RESTART IDENTITY CASCADE"
        ))
        db.commit()

        # Owner: reuse the first user; make sure it can own hotels.
        owner = db.query(User).order_by(User.id).first()
        if owner is None:
            owner = User(name="seed-owner", role=Role.reception, is_active=True)
            db.add(owner)
            db.flush()

        types = [
            HotelType(name="Гостиница", slug="hotel"),
            HotelType(name="Отель", slug="otel"),
            HotelType(name="Хостел", slug="hostel"),
            HotelType(name="Коттедж", slug="cottage"),
            HotelType(name="Гостевой дом", slug="guesthouse"),
            HotelType(name="Юрта", slug="yurt"),
        ]
        db.add_all(types)

        amenity_names = [
            ("Wi-Fi", "wifi"), ("Парковка", "parking"), ("Кондиционер", "ac"),
            ("Завтрак", "breakfast"), ("Бассейн", "pool"), ("Ресторан", "restaurant"),
            ("Терраса", "terrace"), ("Камин", "fireplace"), ("Баня", "sauna"),
        ]
        amenities = [Amenity(name=n, slug=s) for n, s in amenity_names]
        db.add_all(amenities)
        db.flush()

        a = {am.slug: am for am in amenities}
        t = {ht.slug: ht for ht in types}

        def make_hotel(name, type_slug, address, desc, rating, am_slugs, cover, rooms_spec):
            h = Hotel(
                owner_id=owner.id,
                hotel_type_id=t[type_slug].id,
                name=name,
                description=desc,
                address=address,
                latitude=41.85,
                longitude=71.95,
                phone="+996700112233",
                whatsapp="+996700112233",
                email=None,
                check_in_time="14:00",
                check_out_time="12:00",
                status=HotelStatus.approved,
                rating=rating,
            )
            h.amenities = [a[s] for s in am_slugs]
            db.add(h)
            db.flush()
            db.add(Image(hotel_id=h.id, url=cover, is_main=True))
            for extra in rooms_spec.get("hotel_images", []):
                db.add(Image(hotel_id=h.id, url=extra, is_main=False))
            for r in rooms_spec["rooms"]:
                room = Room(
                    hotel_id=h.id,
                    room_number=r["num"],
                    name=r["name"],
                    type=r["type"],
                    price_per_night=r["price"],
                    capacity_adults=r["adults"],
                    capacity_children=r.get("children", 0),
                    description=r["desc"],
                    status=RoomStatus.available,
                )
                room.amenities = [a[s] for s in r.get("amenities", [])]
                db.add(room)
                db.flush()
                db.add(Image(room_id=room.id, url=r["image"], is_main=True))
            return h

        make_hotel(
            "Капсула «Булан-Соготту»", "cottage", "с. Булан-Соготту, Сары-Челек",
            "Уютный современный коттедж в горах Сары-Челека. Панорамные окна с видом на озеро.",
            4.9, ["wifi", "parking", "breakfast", "ac", "terrace", "fireplace"],
            img("1505693416388-ac5ce068fe85"),
            {
                "hotel_images": [img("1518733057094-95b53143d2a7"), img("1566073771259-6a8506099945")],
                "rooms": [
                    {"num": "101", "name": "Капсула на 4 гостя", "type": RoomType.semi_lux,
                     "price": 4500, "adults": 4, "desc": "Двуспальная и две односпальные кровати, санузел, балкон.",
                     "image": img("1505693416388-ac5ce068fe85"), "amenities": ["wifi", "ac"]},
                    {"num": "102", "name": "Люкс с видом на озеро", "type": RoomType.lux,
                     "price": 6800, "adults": 2, "desc": "Премиум-номер с панорамным окном и мини-баром.",
                     "image": img("1582719478250-c89cae4dc85b"), "amenities": ["wifi", "ac"]},
                ],
            },
        )

        make_hotel(
            "Гостевой дом «Чолпон»", "guesthouse", "с. Аркыт, Сары-Челек",
            "Семейный гостевой дом с садом и беседкой. Домашняя кухня, баня на дровах, экскурсии к озеру.",
            4.7, ["wifi", "parking", "breakfast", "sauna"],
            img("1564013799919-ab600027ffc6"),
            {
                "rooms": [
                    {"num": "201", "name": "Стандарт двухместный", "type": RoomType.standard,
                     "price": 2200, "adults": 2, "desc": "Чистый уютный номер с завтраком.",
                     "image": img("1611892440504-42a792e24d32"), "amenities": ["wifi"]},
                    {"num": "202", "name": "Семейный номер", "type": RoomType.family,
                     "price": 3400, "adults": 2, "children": 2, "desc": "Просторный номер для всей семьи.",
                     "image": img("1582719478250-c89cae4dc85b"), "amenities": ["wifi", "breakfast"]},
                ],
            },
        )

        make_hotel(
            "Юрточный лагерь «Сары-Челек»", "yurt", "берег озера Сары-Челек",
            "Аутентичные юрты на берегу заповедного озера. Костёр, национальная кухня, конные прогулки.",
            4.6, ["parking", "breakfast", "restaurant"],
            img("1504280390367-361c6d9f38f4"),
            {
                "rooms": [
                    {"num": "Y1", "name": "Юрта на 3 гостя", "type": RoomType.standard,
                     "price": 1800, "adults": 3, "desc": "Традиционная юрта с печкой.",
                     "image": img("1504280390367-361c6d9f38f4"), "amenities": ["breakfast"]},
                ],
            },
        )

        db.commit()
        n_hotels = db.query(Hotel).count()
        n_rooms = db.query(Room).count()
        print(f"Seeded: {len(types)} types, {len(amenities)} amenities, "
              f"{n_hotels} hotels, {n_rooms} rooms")


if __name__ == "__main__":
    main()
