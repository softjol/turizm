import { api } from "./client";
import type { AmenityResponse, HotelTypeResponse } from "./catalog";

/**
 * Types mirror app/schemas/hotel.py / image.py on the backend.
 */

export type HotelStatus = "pending" | "approved" | "rejected" | "blocked";

export interface HotelImage {
  id: number;
  hotel_id: number | null;
  room_id: number | null;
  url: string;
  is_main: boolean;
  created_at: string;
}

export interface Hotel {
  id: number;
  owner_id: number;
  hotel_type_id: number;
  name: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  whatsapp: string;
  email: string | null;
  check_in_time: string;
  check_out_time: string;
  status: HotelStatus;
  rating: number;
  created_at: string;
  updated_at: string;
  /** Cheapest available room price; populated by the list endpoint, null on detail. */
  price_from: number | null;
  /** Number of reviews; populated by the list endpoint, 0 on detail. */
  reviews_count: number;
  hotel_type: HotelTypeResponse | null;
  images: HotelImage[];
  amenities: AmenityResponse[];
}

/** Body for POST /api/v1/hotels (HotelCreate). */
export interface HotelCreatePayload {
  hotel_type_id: number;
  name: string;
  description: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  phone: string;
  whatsapp: string;
  email?: string | null;
  check_in_time?: string;
  check_out_time?: string;
}

/** Query params for GET /hotels (search). Mirrors app/routers/hotels.py. */
export interface HotelSearchParams {
  hotel_type_id?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  amenity_ids?: number[];
  check_in_date?: string;
  check_out_date?: string;
  search_query?: string;
  page?: number;
  limit?: number;
}

/** GET /api/v1/hotels — public, approved-only catalog with optional filters. */
export async function searchHotels(params: HotelSearchParams = {}): Promise<Hotel[]> {
  const { data } = await api.get<Hotel[]>("/hotels", { params });
  return Array.isArray(data) ? data : [];
}

/** Create a hotel (reception). Returns the created hotel incl. its new id. */
export async function createHotel(payload: HotelCreatePayload): Promise<Hotel> {
  const { data } = await api.post<Hotel>("/hotels", payload);
  return data;
}

/** Replace the amenity set of a hotel (PUT /hotels/{id}/amenities). */
export async function setHotelAmenities(hotelId: number, amenityIds: number[]): Promise<Hotel> {
  const { data } = await api.put<Hotel>(`/hotels/${hotelId}/amenities`, {
    amenity_ids: amenityIds,
  });
  return data;
}

/**
 * Fetch a single hotel by id. Public endpoint, but unlike the catalog list it
 * returns the hotel in ANY status — so a freshly created `pending` hotel is
 * visible here immediately.
 */
export async function getHotel(hotelId: number): Promise<Hotel> {
  const { data } = await api.get<Hotel>(`/hotels/${hotelId}`);
  return data;
}

/** Update a hotel's editable fields (PATCH /reception/hotels/{id}). */
export async function updateHotel(
  hotelId: number,
  patch: Partial<HotelCreatePayload>,
): Promise<Hotel> {
  const { data } = await api.patch<Hotel>(`/reception/hotels/${hotelId}`, patch);
  return data;
}

/** Delete a hotel (DELETE /hotels/{id} — admin only on the backend). */
export async function deleteHotel(hotelId: number): Promise<void> {
  await api.delete(`/hotels/${hotelId}`);
}

/** Backend origin (VITE_API_URL without the /api/v1 suffix), for served media. */
const MEDIA_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace(/\/api\/v1\/?$/, "");

/** Resolve a possibly-relative image URL (e.g. /static/...) to an absolute one. */
export function mediaUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  return `${MEDIA_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Upload a hotel photo (multipart). Returns the created image. */
export async function uploadHotelImage(
  hotelId: number,
  file: File,
  isMain = false,
): Promise<HotelImage> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<HotelImage>(`/reception/hotels/${hotelId}/images`, form, {
    params: { is_main: isMain },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Hotels owned by the current reception/admin user (GET /reception/hotels). */
export async function listReceptionHotels(): Promise<Hotel[]> {
  const { data } = await api.get<Hotel[]>("/reception/hotels");
  return Array.isArray(data) ? data : [];
}

// --- "My hotels" tracking --------------------------------------------------
//
// The backend has no "list my hotels" endpoint yet, so we remember the ids of
// hotels created from this browser and reload them via getHotel(). This is a
// client-side stopgap; when GET /reception/hotels exists, swap this out.

const MY_HOTELS_KEY = "turizm.my_hotel_ids";

export function getMyHotelIds(): number[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(MY_HOTELS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === "number") : [];
  } catch {
    return [];
  }
}

export function addMyHotelId(id: number): void {
  if (typeof localStorage === "undefined") return;
  const ids = getMyHotelIds();
  if (!ids.includes(id)) {
    localStorage.setItem(MY_HOTELS_KEY, JSON.stringify([...ids, id]));
  }
}

export function removeMyHotelId(id: number): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(MY_HOTELS_KEY, JSON.stringify(getMyHotelIds().filter((x) => x !== id)));
}

/** Load all hotels created from this browser (newest first). */
export async function getMyHotels(): Promise<Hotel[]> {
  const ids = getMyHotelIds();
  const results = await Promise.allSettled(ids.map((id) => getHotel(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Hotel> => r.status === "fulfilled")
    .map((r) => r.value)
    .reverse();
}
