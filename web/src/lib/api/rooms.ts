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
  return data;
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
