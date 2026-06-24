export type EstateType = "Гостиница" | "Отель" | "Хостел" | "Коттедж" | "Гостевой дом" | "Юрта";

export interface Room {
  id: string;
  name: string;
  type: "Стандарт" | "Полулюкс" | "Люкс";
  capacity: number;
  price: number;
  description: string;
  image: string;
  amenities: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  reply?: string;
}

export interface Estate {
  id: string;
  name: string;
  type: EstateType;
  address: string;
  description: string;
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  images: string[];
  cover: string;
  amenities: string[];
  rooms: Room[];
  reviews: Review[];
  host: { name: string; phone: string; whatsapp: string };
  checkIn: string;
  checkOut: string;
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const baseAmenities = ["Wi-Fi", "Парковка", "Кондиционер", "Завтрак", "Бассейн", "Ресторан"];

export const estates: Estate[] = [
  {
    id: "kapsula-bulan",
    name: "Капсула «Булан-Соготту»",
    type: "Коттедж",
    address: "с. Булан-Соготту, Сары-Челек",
    description:
      "Уютный современный коттедж в горах Сары-Челека. Панорамные окна с видом на озеро, тёплый деревянный интерьер и собственная зона отдыха у воды.",
    rating: 4.9,
    reviewsCount: 128,
    priceFrom: 4500,
    cover: img("1505693416388-ac5ce068fe85"),
    images: [
      img("1505693416388-ac5ce068fe85"),
      img("1518733057094-95b53143d2a7"),
      img("1566073771259-6a8506099945"),
      img("1582719478250-c89cae4dc85b"),
      img("1611892440504-42a792e24d32"),
    ],
    amenities: ["Wi-Fi", "Парковка", "Завтрак", "Кондиционер", "Терраса", "Камин"],
    checkIn: "14:00",
    checkOut: "12:00",
    host: { name: "Айгуль", phone: "+996 700 11 22 33", whatsapp: "+996700112233" },
    rooms: [
      {
        id: "r1",
        name: "Капсула на 4 гостя",
        type: "Полулюкс",
        capacity: 4,
        price: 4500,
        description: "Двуспальная кровать и две односпальные, отдельный санузел, балкон с видом.",
        image: img("1505693416388-ac5ce068fe85"),
        amenities: ["Wi-Fi", "Кондиционер", "Санузел", "Балкон"],
      },
      {
        id: "r2",
        name: "Люкс с видом на озеро",
        type: "Люкс",
        capacity: 2,
        price: 6800,
        description: "Премиум-номер с панорамным окном, мини-баром и зоной для завтрака.",
        image: img("1582719478250-c89cae4dc85b"),
        amenities: ["Wi-Fi", "Кондиционер", "Мини-бар", "Балкон"],
      },
    ],
    reviews: [
      {
        id: "rv1",
        author: "Бакыт",
        rating: 5,
        date: "12 мая 2026",
        text: "Невероятное место. Утром туман над озером — словно картина. Хозяева очень внимательные.",
        reply: "Спасибо, ждём вас снова!",
      },
      {
        id: "rv2",
        author: "Айдай",
        rating: 5,
        date: "3 мая 2026",
        text: "Чисто, уютно, тепло даже ночью. Завтрак включён — каша, лепёшки, варенье.",
      },
    ],
  },
  {
    id: "guest-house-cholpon",
    name: "Гостевой дом «Чолпон»",
    type: "Гостевой дом",
    address: "с. Аркыт, Сары-Челек",
    description:
      "Семейный гостевой дом с садом и беседкой. Домашняя кухня, баня на дровах, экскурсии к озеру.",
    rating: 4.7,
    reviewsCount: 86,
    priceFrom: 2200,
    cover: img("1564013799919-ab600027ffc6"),
    images: [
      img("1564013799919-ab600027ffc6"),
      img("1520250497591-112f2f40a3f4"),
      img("1571896349842-33c89424de2d"),
    ],
    amenities: ["Wi-Fi", "Парковка", "Завтрак", "Баня", "Сад"],
    checkIn: "13:00",
    checkOut: "11:00",
    host: { name: "Нурлан", phone: "+996 555 33 44 55", whatsapp: "+996555334455" },
    rooms: [
      {
        id: "r1",
        name: "Семейный номер",
        type: "Стандарт",
        capacity: 4,
        price: 2200,
        description: "Большая комната с двумя кроватями, общий санузел на этаже.",
        image: img("1505693416388-ac5ce068fe85"),
        amenities: ["Wi-Fi", "Окно в сад"],
      },
      {
        id: "r2",
        name: "Двухместный с балконом",
        type: "Полулюкс",
        capacity: 2,
        price: 3000,
        description: "Тихий номер с видом на горы, балкон, отдельный санузел.",
        image: img("1566665797739-1674de7a421a"),
        amenities: ["Wi-Fi", "Санузел", "Балкон"],
      },
    ],
    reviews: [
      {
        id: "rv1",
        author: "Тилек",
        rating: 5,
        date: "20 апр 2026",
        text: "Очень душевно. Спасибо!",
      },
      {
        id: "rv2",
        author: "Анна",
        rating: 4,
        date: "15 апр 2026",
        text: "Хорошее соотношение цены и качества.",
      },
    ],
  },
  {
    id: "hotel-saryjazz",
    name: "Отель «Сары-Жаз»",
    type: "Отель",
    address: "г. Каракол, ул. Токтогула 14",
    description:
      "Современный отель в центре города, в часе езды от Сары-Челека. Конференц-зал, ресторан, спа.",
    rating: 4.6,
    reviewsCount: 312,
    priceFrom: 5800,
    cover: img("1566073771259-6a8506099945"),
    images: [
      img("1566073771259-6a8506099945"),
      img("1551882547-ff40c63fe5fa"),
      img("1551776235-dde6d4829808"),
    ],
    amenities: baseAmenities,
    checkIn: "14:00",
    checkOut: "12:00",
    host: { name: "Ресепшен", phone: "+996 312 55 66 77", whatsapp: "+996312556677" },
    rooms: [
      {
        id: "r1",
        name: "Стандарт двухместный",
        type: "Стандарт",
        capacity: 2,
        price: 5800,
        description: "Современный номер с большой кроватью.",
        image: img("1551882547-ff40c63fe5fa"),
        amenities: ["Wi-Fi", "Кондиционер", "Санузел", "Телевизор"],
      },
    ],
    reviews: [
      { id: "rv1", author: "Гость", rating: 5, date: "1 июн 2026", text: "Отличный сервис." },
    ],
  },
  {
    id: "yurta-aigul",
    name: "Юрточный лагерь «Айгуль»",
    type: "Юрта",
    address: "Плато Сары-Челек",
    description: "Аутентичные юрты у горного озера. Конные прогулки, ужин у костра, звёздное небо.",
    rating: 4.8,
    reviewsCount: 64,
    priceFrom: 1800,
    cover: img("1504280390367-361c6d9f38f4"),
    images: [img("1504280390367-361c6d9f38f4"), img("1510798831971-661eb04b3739")],
    amenities: ["Завтрак", "Парковка", "Конные прогулки", "Костёр"],
    checkIn: "15:00",
    checkOut: "11:00",
    host: { name: "Алмаз", phone: "+996 707 88 99 00", whatsapp: "+996707889900" },
    rooms: [
      {
        id: "r1",
        name: "Юрта на 4 гостя",
        type: "Стандарт",
        capacity: 4,
        price: 1800,
        description: "Традиционная юрта с тёплыми одеялами и печкой.",
        image: img("1504280390367-361c6d9f38f4"),
        amenities: ["Печка", "Завтрак"],
      },
    ],
    reviews: [
      { id: "rv1", author: "Мирлан", rating: 5, date: "10 июн 2026", text: "Незабываемо!" },
    ],
  },
  {
    id: "hostel-altyn",
    name: "Хостел «Алтын»",
    type: "Хостел",
    address: "г. Бишкек, ул. Чуй 220",
    description: "Бюджетный хостел с общей кухней, идеален для бэкпекеров.",
    rating: 4.3,
    reviewsCount: 145,
    priceFrom: 700,
    cover: img("1555854877-bab0e564b8d5"),
    images: [img("1555854877-bab0e564b8d5"), img("1522771739844-6a9f6d5f14af")],
    amenities: ["Wi-Fi", "Общая кухня", "Прачечная"],
    checkIn: "14:00",
    checkOut: "11:00",
    host: { name: "Ресепшен", phone: "+996 312 11 22 33", whatsapp: "+996312112233" },
    rooms: [
      {
        id: "r1",
        name: "Кровать в общем номере",
        type: "Стандарт",
        capacity: 1,
        price: 700,
        description: "Кровать в комнате на 6 человек.",
        image: img("1555854877-bab0e564b8d5"),
        amenities: ["Wi-Fi", "Шкафчик"],
      },
    ],
    reviews: [
      { id: "rv1", author: "Дима", rating: 4, date: "2 июн 2026", text: "Чисто и недорого." },
    ],
  },
  {
    id: "cottage-jeti",
    name: "Коттедж «Жети-Огуз»",
    type: "Коттедж",
    address: "Ущелье Жети-Огуз",
    description: "Деревянный коттедж у реки, с камином и панорамной верандой.",
    rating: 4.9,
    reviewsCount: 92,
    priceFrom: 7200,
    cover: img("1518733057094-95b53143d2a7"),
    images: [img("1518733057094-95b53143d2a7"), img("1449158743715-0a90ebb6d2d8")],
    amenities: ["Wi-Fi", "Камин", "Парковка", "Завтрак", "Терраса"],
    checkIn: "14:00",
    checkOut: "12:00",
    host: { name: "Эрлан", phone: "+996 555 99 88 77", whatsapp: "+996555998877" },
    rooms: [
      {
        id: "r1",
        name: "Весь коттедж",
        type: "Люкс",
        capacity: 6,
        price: 7200,
        description: "3 спальни, 2 санузла, кухня, гостиная с камином.",
        image: img("1518733057094-95b53143d2a7"),
        amenities: ["Wi-Fi", "Камин", "Кухня", "Стиральная машина"],
      },
    ],
    reviews: [
      { id: "rv1", author: "Сапар", rating: 5, date: "5 июн 2026", text: "Сказочное место." },
    ],
  },
];

export const categories: { type: EstateType; icon: string }[] = [
  { type: "Гостиница", icon: "🏨" },
  { type: "Отель", icon: "🛎️" },
  { type: "Гостевой дом", icon: "🏡" },
  { type: "Коттедж", icon: "🏘️" },
  { type: "Хостел", icon: "🛏️" },
  { type: "Юрта", icon: "⛺" },
];

export const allAmenities = [
  "Wi-Fi",
  "Парковка",
  "Кондиционер",
  "Бассейн",
  "Ресторан",
  "Завтрак",
  "Баня",
  "Камин",
];

export const mockBookings = [
  {
    id: "b1",
    estate: estates[0],
    room: estates[0].rooms[0],
    checkIn: "2026-07-10",
    checkOut: "2026-07-14",
    guests: 4,
    total: 18000,
    deposit: 5400,
    status: "Подтверждено" as const,
  },
  {
    id: "b2",
    estate: estates[1],
    room: estates[1].rooms[1],
    checkIn: "2026-08-02",
    checkOut: "2026-08-05",
    guests: 2,
    total: 9000,
    deposit: 2700,
    status: "Ожидает оплаты" as const,
  },
];
