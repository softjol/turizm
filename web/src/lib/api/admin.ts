import { api } from "./client";
import type { User, Role } from "./auth";
import type { Hotel, HotelStatus } from "./hotels";
import type { HotelTypeResponse, AmenityResponse } from "./catalog";

// --- Users -----------------------------------------------------------------

/** GET /api/v1/users — all users (admin only). */
export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export async function updateUserRole(userId: number, role: Role): Promise<User> {
  const { data } = await api.patch<User>(`/users/${userId}/role`, { role });
  return data;
}

/** Block/unblock a user (is_active=false blocks). */
export async function setUserActive(userId: number, isActive: boolean): Promise<User> {
  const { data } = await api.patch<User>(`/users/${userId}/block`, null, {
    params: { is_active: isActive },
  });
  return data;
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/users/${userId}`);
}

// --- Hotel moderation ------------------------------------------------------

export async function moderateHotel(hotelId: number, status: HotelStatus): Promise<Hotel> {
  const { data } = await api.patch<Hotel>(`/hotels/${hotelId}/status`, { status });
  return data;
}

// --- Hotel types (categories) ----------------------------------------------

export async function createHotelType(name: string, slug: string): Promise<HotelTypeResponse> {
  const { data } = await api.post<HotelTypeResponse>("/hotel-types", { name, slug });
  return data;
}

export async function deleteHotelType(id: number): Promise<void> {
  await api.delete(`/hotel-types/${id}`);
}

// --- Amenities -------------------------------------------------------------

export async function createAmenity(name: string, slug: string): Promise<AmenityResponse> {
  const { data } = await api.post<AmenityResponse>("/amenities", { name, slug });
  return data;
}

export async function deleteAmenity(id: number): Promise<void> {
  await api.delete(`/amenities/${id}`);
}

// --- Complaints ------------------------------------------------------------

export interface ComplaintResponse {
  id: number;
  user_id: number;
  target_type: string;
  target_id: number;
  reason: string;
  status: string;
  created_at: string;
}

export async function getComplaints(): Promise<ComplaintResponse[]> {
  const { data } = await api.get<ComplaintResponse[]>("/complaints");
  return data;
}

export async function updateComplaintStatus(
  id: number,
  status: string,
): Promise<ComplaintResponse> {
  const { data } = await api.patch<ComplaintResponse>(`/complaints/${id}/status`, { status });
  return data;
}
