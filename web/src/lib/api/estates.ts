import type { Estate, Room as UIRoom, Review as UIReview, EstateType } from "@/lib/mock-data";
import type { Hotel } from "./hotels";
import { searchHotels, getHotel, type HotelSearchParams } from "./hotels";
import { getHotelRooms, type RoomResponse, type RoomType } from "./rooms";
import { getHotelReviews, type ReviewResponse } from "./reviews";

/**
 * Adapter layer: the UI components were built against the `Estate` shape from
 * mock-data. Rather than rewrite every component, we map the backend's
 * Hotel / Room / Review responses onto that same shape.
 */

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&h=800&q=80";

const ROOM_TYPE_LABEL: Record<RoomType, UIRoom["type"]> = {
  standard: "Стандарт",
  semi_lux: "Полулюкс",
  lux: "Люкс",
  family: "Полулюкс",
  dorm: "Стандарт",
};

/** Hotel images, main first, as plain URLs. */
function hotelImageUrls(hotel: Hotel): string[] {
  const urls = [...hotel.images]
    .sort((a, b) => Number(b.is_main) - Number(a.is_main))
    .map((i) => i.url);
  return urls.length ? urls : [PLACEHOLDER_IMAGE];
}

function roomImageUrl(room: RoomResponse, fallback: string): string {
  const main = room.images.find((i) => i.is_main) ?? room.images[0];
  return main?.url ?? fallback;
}

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function mapRoom(room: RoomResponse, fallbackImage: string): UIRoom {
  return {
    id: String(room.id),
    name: room.name,
    type: ROOM_TYPE_LABEL[room.type] ?? "Стандарт",
    capacity: room.capacity_adults + room.capacity_children,
    price: Number(room.price_per_night),
    description: room.description,
    image: roomImageUrl(room, fallbackImage),
    amenities: room.amenities.map((a) => a.name),
  };
}

function mapReview(review: ReviewResponse): UIReview {
  return {
    id: String(review.id),
    author: `Гость №${review.user_id}`,
    rating: review.rating,
    date: formatReviewDate(review.created_at),
    text: review.comment,
    reply: review.reply ?? undefined,
  };
}

/** Build a full Estate from a hotel and its (already fetched) rooms + reviews. */
export function toEstate(hotel: Hotel, rooms: RoomResponse[], reviews: ReviewResponse[]): Estate {
  const images = hotelImageUrls(hotel);
  const cover = images[0];
  const uiRooms = rooms.map((r) => mapRoom(r, cover));
  const priceFrom = uiRooms.length ? Math.min(...uiRooms.map((r) => r.price)) : 0;

  return {
    id: String(hotel.id),
    name: hotel.name,
    type: (hotel.hotel_type?.name ?? "Гостиница") as EstateType,
    address: hotel.address,
    description: hotel.description,
    rating: hotel.rating,
    reviewsCount: reviews.length,
    priceFrom,
    images,
    cover,
    amenities: hotel.amenities.map((a) => a.name),
    rooms: uiRooms,
    reviews: reviews.map(mapReview),
    host: { name: hotel.name, phone: hotel.phone, whatsapp: hotel.whatsapp },
    checkIn: hotel.check_in_time,
    checkOut: hotel.check_out_time,
  };
}

/**
 * Lightweight Estate for catalog cards. Built purely from the hotel list
 * response (which now carries price_from + reviews_count), so the whole
 * catalog is a single request — no per-hotel rooms/reviews fetches.
 * `rooms`/`reviews` are left empty; the detail page loads those.
 */
export function hotelToEstateSummary(hotel: Hotel): Estate {
  const images = hotelImageUrls(hotel);
  return {
    id: String(hotel.id),
    name: hotel.name,
    type: (hotel.hotel_type?.name ?? "Гостиница") as EstateType,
    address: hotel.address,
    description: hotel.description,
    rating: hotel.rating,
    reviewsCount: hotel.reviews_count ?? 0,
    priceFrom: hotel.price_from ?? 0,
    images,
    cover: images[0],
    amenities: hotel.amenities.map((a) => a.name),
    rooms: [],
    reviews: [],
    host: { name: hotel.name, phone: hotel.phone, whatsapp: hotel.whatsapp },
    checkIn: hotel.check_in_time,
    checkOut: hotel.check_out_time,
  };
}

/** Catalog list as Estates — one request, card-ready. */
export async function getEstates(params: HotelSearchParams = {}): Promise<Estate[]> {
  const hotels = await searchHotels(params);
  return hotels.map(hotelToEstateSummary);
}

/** Single Estate by hotel id, with rooms + reviews. */
export async function getEstate(id: number): Promise<Estate> {
  const [hotel, rooms, reviews] = await Promise.all([
    getHotel(id),
    getHotelRooms(id).catch(() => []),
    getHotelReviews(id).catch(() => []),
  ]);
  return toEstate(hotel, rooms, reviews);
}
