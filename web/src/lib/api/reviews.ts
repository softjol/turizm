import { api } from "./client";

/** Mirrors app/schemas/review.py. */
export interface ReviewResponse {
  id: number;
  hotel_id: number;
  user_id: number;
  booking_id: number;
  rating: number;
  comment: string;
  reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreatePayload {
  booking_id: number;
  /** 1..5 */
  rating: number;
  comment: string;
}

/** GET /api/v1/hotels/{id}/reviews — public list of a hotel's reviews. */
export async function getHotelReviews(hotelId: number): Promise<ReviewResponse[]> {
  const { data } = await api.get<ReviewResponse[]>(`/hotels/${hotelId}/reviews`);
  return data;
}

/** POST /api/v1/hotels/{id}/reviews — leave a review (auth required). */
export async function createReview(
  hotelId: number,
  payload: ReviewCreatePayload,
): Promise<ReviewResponse> {
  const { data } = await api.post<ReviewResponse>(`/hotels/${hotelId}/reviews`, payload);
  return data;
}
