import { api } from "./client";
import type { HotelImage } from "./hotels";
import type { AmenityResponse } from "./catalog";

/** Mirrors app/schemas/room.py. */
export type RoomType = "standard" | "semi_lux" | "lux" | "family" | "dorm";
export type RoomStatus = "available" | "maintenance" | "inactive";

export interface RoomResponse {
  id: number;
  hotel_id: number;
  room_number: string;
  name: string;
  type: RoomType;
  /** Decimal serialized as string by FastAPI. */
  price_per_night: string;
  capacity_adults: number;
  capacity_children: number;
  description: string;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
  images: HotelImage[];
  amenities: AmenityResponse[];
}

/** GET /api/v1/hotels/{id}/rooms — public list of a hotel's rooms. */
export async function getHotelRooms(hotelId: number): Promise<RoomResponse[]> {
  const { data } = await api.get<RoomResponse[]>(`/hotels/${hotelId}/rooms`);
  return Array.isArray(data) ? data : [];
}

/** GET /api/v1/rooms/{id} — single room with images + amenities. */
export async function getRoom(roomId: number): Promise<RoomResponse> {
  const { data } = await api.get<RoomResponse>(`/rooms/${roomId}`);
  return data;
}

/** Body for POST /api/v1/reception/hotels/{id}/rooms (RoomCreate). */
export interface RoomCreatePayload {
  room_number: string;
  name: string;
  type?: RoomType;
  price_per_night: number;
  capacity_adults?: number;
  capacity_children?: number;
  description: string;
}

/** Create a room in a hotel (reception). */
export async function createRoom(
  hotelId: number,
  payload: RoomCreatePayload,
): Promise<RoomResponse> {
  const { data } = await api.post<RoomResponse>(`/reception/hotels/${hotelId}/rooms`, payload);
  return data;
}

/** Update a room (reception) — PATCH /reception/rooms/{id}. */
export async function updateRoom(
  roomId: number,
  patch: Partial<RoomCreatePayload> & { status?: RoomStatus },
): Promise<RoomResponse> {
  const { data } = await api.patch<RoomResponse>(`/reception/rooms/${roomId}`, patch);
  return data;
}

/** Delete a room (reception) — DELETE /reception/rooms/{id}. */
export async function deleteRoom(roomId: number): Promise<void> {
  await api.delete(`/reception/rooms/${roomId}`);
}

/** Upload a room photo (multipart). Returns the created image. */
export async function uploadRoomImage(
  roomId: number,
  file: File,
  isMain = false,
): Promise<HotelImage> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<HotelImage>(`/reception/rooms/${roomId}/images`, form, {
    params: { is_main: isMain },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Delete a room photo — DELETE /reception/rooms/{id}/images/{imageId}. */
export async function deleteRoomImage(roomId: number, imageId: number): Promise<void> {
  await api.delete(`/reception/rooms/${roomId}/images/${imageId}`);
}

export interface RoomCalendar {
  room_id: number;
  occupied_periods: { date_from: string; date_to: string }[];
}

/** GET /api/v1/rooms/{id}/calendar?start_date&end_date — occupancy periods. */
export async function getRoomCalendar(
  roomId: number,
  startDate: string,
  endDate: string,
): Promise<RoomCalendar> {
  const { data } = await api.get<RoomCalendar>(`/rooms/${roomId}/calendar`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return data;
}
