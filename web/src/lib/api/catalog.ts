import { api } from "./client";

/**
 * Public reference data used when building a hotel.
 * Mirrors app/schemas/hotel_type.py and amenity.py.
 */

export interface HotelTypeResponse {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface AmenityResponse {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

/** GET /api/v1/hotel-types — public list of hotel categories. */
export async function getHotelTypes(): Promise<HotelTypeResponse[]> {
  const { data } = await api.get<HotelTypeResponse[]>("/hotel-types");
  return Array.isArray(data) ? data : [];
}

/** GET /api/v1/amenities — public list of amenities. */
export async function getAmenities(): Promise<AmenityResponse[]> {
  const { data } = await api.get<AmenityResponse[]>("/amenities");
  return Array.isArray(data) ? data : [];
}
