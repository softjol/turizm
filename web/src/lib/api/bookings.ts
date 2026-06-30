import { api } from "./client";

/** Mirrors app/schemas/booking.py. */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled"
  | "rejected";

export interface BookingResponse {
  id: number;
  user_id: number;
  room_id: number;
  date_from: string;
  date_to: string;
  guests: number;
  /** Decimals serialized as strings. */
  total_amount: string;
  deposit_amount: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingCreatePayload {
  room_id: number;
  /** ISO date (YYYY-MM-DD). */
  date_from: string;
  date_to: string;
  guests: number;
}

/** POST /api/v1/bookings — create a booking (auth required). */
export async function createBooking(payload: BookingCreatePayload): Promise<BookingResponse> {
  const { data } = await api.post<BookingResponse>("/bookings", payload);
  return data;
}

/** GET /api/v1/bookings — bookings of the current user. */
export async function getMyBookings(): Promise<BookingResponse[]> {
  const { data } = await api.get<BookingResponse[]>("/bookings");
  return Array.isArray(data) ? data : [];
}

/** GET /api/v1/bookings/{id} — single booking. */
export async function getBooking(bookingId: number): Promise<BookingResponse> {
  const { data } = await api.get<BookingResponse>(`/bookings/${bookingId}`);
  return data;
}

/** PATCH /api/v1/bookings/{id}/cancel — cancel a booking. */
export async function cancelBooking(bookingId: number): Promise<BookingResponse> {
  const { data } = await api.patch<BookingResponse>(`/bookings/${bookingId}/cancel`);
  return data;
}

// --- Reception side (host manages bookings for their hotels) ----------------

/** GET /api/v1/reception/hotels/{id}/bookings — bookings for one of my hotels. */
export async function listHotelBookings(hotelId: number): Promise<BookingResponse[]> {
  const { data } = await api.get<BookingResponse[]>(`/reception/hotels/${hotelId}/bookings`);
  return Array.isArray(data) ? data : [];
}

async function receptionBookingAction(
  bookingId: number,
  action: "confirm" | "reject" | "check-in" | "check-out",
): Promise<BookingResponse> {
  const { data } = await api.patch<BookingResponse>(`/reception/bookings/${bookingId}/${action}`);
  return data;
}

export const confirmBooking = (id: number) => receptionBookingAction(id, "confirm");
export const rejectBooking = (id: number) => receptionBookingAction(id, "reject");
export const checkInBooking = (id: number) => receptionBookingAction(id, "check-in");
export const checkOutBooking = (id: number) => receptionBookingAction(id, "check-out");
