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
