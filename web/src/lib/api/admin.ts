import { api } from "./client";
import type { User, Role } from "./auth";
import type { Hotel, HotelStatus } from "./hotels";
import type { HotelTypeResponse, AmenityResponse } from "./catalog";
import type { BookingResponse, BookingStatus } from "./bookings";

// --- Users -----------------------------------------------------------------

/** GET /api/v1/users - all users (admin only). */
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

/** GET /api/v1/admin/hotels - every hotel regardless of status (admin moderation). */
export async function getAdminHotels(): Promise<Hotel[]> {
  const { data } = await api.get<Hotel[]>("/admin/hotels");
  return data;
}

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

// --- Bookings ----------------------------------------------------------------

/** Mirrors app/schemas/booking.py AdminBookingResponse. */
export interface AdminBookingResponse {
  id: number;
  /** Null for walk-in bookings created by reception without a site account. */
  user_id: number | null;
  guest_name: string;
  guest_phone: string | null;
  room_id: number;
  room_number: string;
  hotel_id: number;
  hotel_name: string;
  date_from: string;
  date_to: string;
  guests: number;
  total_amount: string;
  deposit_amount: string;
  is_paid: boolean;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

/** GET /api/v1/admin/bookings - bookings on the platform, optionally filtered by status, paginated. */
export async function getAdminBookings(
  status?: BookingStatus,
  page = 1,
  limit = 100,
): Promise<AdminBookingResponse[]> {
  const { data } = await api.get<AdminBookingResponse[]>("/admin/bookings", {
    params: { ...(status ? { status } : undefined), page, limit },
  });
  return Array.isArray(data) ? data : [];
}

/** PATCH /api/v1/admin/bookings/{id}/cancel - admin cancels any booking. */
export async function adminCancelBooking(bookingId: number): Promise<BookingResponse> {
  const { data } = await api.patch<BookingResponse>(`/admin/bookings/${bookingId}/cancel`);
  return data;
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
