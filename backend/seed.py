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
        else:
            owner.role = Role.reception
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

        # Additional hotels across the rest of Kyrgyzstan (data-driven: same
        # shape as make_hotel's rooms_spec, just listed instead of called
        # individually since there's no per-entry logic to vary).
        photos = [
            img("1505693416388-ac5ce068fe85"), img("1518733057094-95b53143d2a7"),
            img("1566073771259-6a8506099945"), img("1582719478250-c89cae4dc85b"),
            img("1564013799919-ab600027ffc6"), img("1611892440504-42a792e24d32"),
            img("1504280390367-361c6d9f38f4"), img("1501785888041-af3ef285b470"),
        ]

        extra_hotels = [
            dict(name="Отель «Достук Plaza»", type_slug="otel", address="г. Бишкек, ул. Чуй 45",
                 desc="Бизнес-отель в центре столицы, рядом с Ала-Тоо.", rating=4.5,
                 am_slugs=["wifi", "parking", "ac", "breakfast", "restaurant"],
                 rooms=[
                     {"num": "301", "name": "Стандарт", "type": RoomType.standard, "price": 3200, "adults": 2,
                      "desc": "Комфортный номер в центре города.", "amenities": ["wifi", "ac"]},
                     {"num": "302", "name": "Люкс", "type": RoomType.lux, "price": 5500, "adults": 2,
                      "desc": "Просторный номер с рабочей зоной.", "amenities": ["wifi", "ac", "breakfast"]},
                 ]),
            dict(name="Хостел «Interhouse»", type_slug="hostel", address="г. Бишкек, ул. Киевская 12",
                 desc="Бюджетный хостел для туристов и бэкпекеров, 5 минут до вокзала.", rating=4.2,
                 am_slugs=["wifi", "parking"],
                 rooms=[
                     {"num": "1", "name": "Койко-место в общем номере", "type": RoomType.dorm, "price": 700,
                      "adults": 1, "desc": "Кровать в номере на 6 человек, общая кухня.", "amenities": ["wifi"]},
                 ]),
            dict(name="Отель «Golden Beach»", type_slug="otel", address="г. Чолпон-Ата, побережье Иссык-Куля",
                 desc="Отель на первой линии озера Иссык-Куль с собственным пляжем.", rating=4.6,
                 am_slugs=["wifi", "parking", "pool", "restaurant", "breakfast"],
                 rooms=[
                     {"num": "101", "name": "Стандарт с видом на озеро", "type": RoomType.standard, "price": 3800,
                      "adults": 2, "desc": "Номер с балконом и видом на Иссык-Куль.", "amenities": ["wifi", "ac"]},
                     {"num": "102", "name": "Семейный люкс", "type": RoomType.family, "price": 6200, "adults": 2,
                      "children": 2, "desc": "Двухкомнатный номер для семьи.", "amenities": ["wifi", "ac", "breakfast"]},
                 ]),
            dict(name="Гостевой дом «Иссык-Куль Бриз»", type_slug="guesthouse",
                 address="г. Чолпон-Ата, ул. Приозёрная 8",
                 desc="Уютный гостевой дом в 5 минутах ходьбы от пляжа.", rating=4.4,
                 am_slugs=["wifi", "parking", "breakfast"],
                 rooms=[
                     {"num": "1", "name": "Стандарт двухместный", "type": RoomType.standard, "price": 2400,
                      "adults": 2, "desc": "Простой чистый номер с завтраком.", "amenities": ["wifi", "breakfast"]},
                 ]),
            dict(name="Пансионат «Азия»", type_slug="hotel", address="с. Бостери, Иссык-Кульская область",
                 desc="Пансионат с бассейном и анимацией для детей, популярное место летнего отдыха.", rating=4.3,
                 am_slugs=["wifi", "parking", "pool", "restaurant"],
                 rooms=[
                     {"num": "201", "name": "Стандарт", "type": RoomType.standard, "price": 2600, "adults": 2,
                      "desc": "Номер с видом на сад.", "amenities": ["wifi"]},
                     {"num": "202", "name": "Семейный", "type": RoomType.family, "price": 4200, "adults": 2,
                      "children": 2, "desc": "Номер для семьи с детьми.", "amenities": ["wifi", "pool"]},
                 ]),
            dict(name="Коттеджи «У гор»", type_slug="cottage", address="с. Григорьевка, Иссык-Кульская область",
                 desc="Отдельные коттеджи у подножия ущелья Григорьевка.", rating=4.7,
                 am_slugs=["wifi", "parking", "fireplace", "terrace"],
                 rooms=[
                     {"num": "C1", "name": "Коттедж на 4 гостя", "type": RoomType.semi_lux, "price": 5000,
                      "adults": 4, "desc": "Отдельный домик с камином и террасой.", "amenities": ["wifi", "fireplace"]},
                 ]),
            dict(name="Отель «Karakol Inn»", type_slug="otel", address="г. Каракол, ул. Гебзе 3",
                 desc="Уютный отель для туристов, отправляющихся в горы Каракола.", rating=4.5,
                 am_slugs=["wifi", "parking", "breakfast", "ac"],
                 rooms=[
                     {"num": "101", "name": "Стандарт", "type": RoomType.standard, "price": 2800, "adults": 2,
                      "desc": "Тёплый номер с видом на горы.", "amenities": ["wifi", "ac"]},
                 ]),
            dict(name="Гостевой дом «Эдельвейс»", type_slug="guesthouse", address="г. Каракол, ул. Ленина 21",
                 desc="Семейный гостевой дом рядом с центральным рынком Каракола.", rating=4.4,
                 am_slugs=["wifi", "breakfast", "sauna"],
                 rooms=[
                     {"num": "1", "name": "Стандарт", "type": RoomType.standard, "price": 2000, "adults": 2,
                      "desc": "Простой уютный номер.", "amenities": ["wifi", "breakfast"]},
                 ]),
            dict(name="Юрточный лагерь «Барскоон»", type_slug="yurt", address="ущелье Барскоон",
                 desc="Юрточный лагерь у водопадов Барскоона, национальная кухня и конные туры.", rating=4.6,
                 am_slugs=["parking", "breakfast", "restaurant"],
                 rooms=[
                     {"num": "Y1", "name": "Юрта на 4 гостя", "type": RoomType.standard, "price": 1900,
                      "adults": 4, "desc": "Традиционная юрта с тёплыми одеялами.", "amenities": ["breakfast"]},
                 ]),
            dict(name="Гостиница «Нарын»", type_slug="hotel", address="г. Нарын, ул. Ленина 10",
                 desc="Простая гостиница для остановки по пути на Торугарт и Сон-Куль.", rating=4.1,
                 am_slugs=["wifi", "parking"],
                 rooms=[
                     {"num": "101", "name": "Стандарт", "type": RoomType.standard, "price": 1800, "adults": 2,
                      "desc": "Номер эконом-класса.", "amenities": ["wifi"]},
                 ]),
            dict(name="Юрточный лагерь «Сон-Куль»", type_slug="yurt", address="озеро Сон-Куль",
                 desc="Высокогорный юрточный лагерь на берегу озера Сон-Куль (3016 м).", rating=4.8,
                 am_slugs=["breakfast", "restaurant"],
                 rooms=[
                     {"num": "Y1", "name": "Юрта на 3 гостя", "type": RoomType.standard, "price": 2100,
                      "adults": 3, "desc": "Юрта с видом на озеро и горы.", "amenities": ["breakfast"]},
                 ]),
            dict(name="Отель «Ош Нуру»", type_slug="otel", address="г. Ош, ул. Курманжан Датки 55",
                 desc="Современный отель в центре Оша, рядом с горой Сулайман-Тоо.", rating=4.5,
                 am_slugs=["wifi", "parking", "ac", "breakfast", "restaurant"],
                 rooms=[
                     {"num": "201", "name": "Стандарт", "type": RoomType.standard, "price": 2900, "adults": 2,
                      "desc": "Комфортный номер в центре Оша.", "amenities": ["wifi", "ac"]},
                     {"num": "202", "name": "Люкс", "type": RoomType.lux, "price": 4800, "adults": 2,
                      "desc": "Просторный номер с видом на город.", "amenities": ["wifi", "ac", "breakfast"]},
                 ]),
            dict(name="Хостел «Silk Road»", type_slug="hostel", address="г. Ош, ул. Ленина 8",
                 desc="Бюджетный хостел для путешественников по Великому Шёлковому пути.", rating=4.3,
                 am_slugs=["wifi"],
                 rooms=[
                     {"num": "1", "name": "Койко-место", "type": RoomType.dorm, "price": 600, "adults": 1,
                      "desc": "Кровать в общем номере на 8 человек.", "amenities": ["wifi"]},
                 ]),
            dict(name="Санаторий «Джалал-Абад»", type_slug="hotel", address="г. Джалал-Абад, курортная зона",
                 desc="Санаторий с минеральными источниками, лечебные и оздоровительные программы.", rating=4.4,
                 am_slugs=["wifi", "parking", "pool", "restaurant"],
                 rooms=[
                     {"num": "301", "name": "Стандарт", "type": RoomType.standard, "price": 2500, "adults": 2,
                      "desc": "Номер с доступом к минеральным ваннам.", "amenities": ["wifi", "pool"]},
                 ]),
            dict(name="Гостевой дом «Ореховый рай»", type_slug="guesthouse", address="с. Арсланбоб",
                 desc="Гостевой дом в самом большом ореховом лесу в мире.", rating=4.7,
                 am_slugs=["wifi", "breakfast", "terrace"],
                 rooms=[
                     {"num": "1", "name": "Стандарт", "type": RoomType.standard, "price": 1900, "adults": 2,
                      "desc": "Уютный номер с видом на ореховый лес.", "amenities": ["wifi", "breakfast"]},
                 ]),
            dict(name="Коттедж «У водопада»", type_slug="cottage", address="с. Арсланбоб, у Большого водопада",
                 desc="Коттедж в пешей доступности от Большого арсланбобского водопада.", rating=4.6,
                 am_slugs=["parking", "terrace", "fireplace"],
                 rooms=[
                     {"num": "C1", "name": "Коттедж на 5 гостей", "type": RoomType.semi_lux, "price": 4200,
                      "adults": 5, "desc": "Дом с террасой и видом на водопад.", "amenities": ["fireplace"]},
                 ]),
            dict(name="Гостиница «Чуй»", type_slug="hotel", address="г. Токмок, ул. Фрунзе 5",
                 desc="Гостиница для остановки по пути к башне Бурана и Чуйской долине.", rating=4.0,
                 am_slugs=["wifi", "parking"],
                 rooms=[
                     {"num": "101", "name": "Стандарт", "type": RoomType.standard, "price": 1700, "adults": 2,
                      "desc": "Простой эконом-номер.", "amenities": ["wifi"]},
                 ]),
        ]

        for i, spec in enumerate(extra_hotels):
            make_hotel(
                spec["name"], spec["type_slug"], spec["address"], spec["desc"], spec["rating"],
                spec["am_slugs"], photos[i % len(photos)],
                {"rooms": [{**r, "image": photos[(i + j + 1) % len(photos)]}
                           for j, r in enumerate(spec["rooms"])]},
            )

        db.commit()
        n_hotels = db.query(Hotel).count()
        n_rooms = db.query(Room).count()
        print(f"Seeded: {len(types)} types, {len(amenities)} amenities, "
              f"{n_hotels} hotels, {n_rooms} rooms")


if __name__ == "__main__":
    main()
