/**
 * UI domain types. These were originally defined alongside mock data; the app
 * now loads real data from the API and maps it onto these shapes (see
 * lib/api/estates.ts). Kept here so no component depends on mock data.
 */

export type EstateType = string;

export interface Room {
  id: string;
  name: string;
  type: "Стандарт" | "Полулюкс" | "Люкс";
  capacity: number;
  price: number;
  bedCount: number;
  pricePerBed: number | null;
  description: string;
  image: string;
  amenities: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  reply?: string;
}

export interface Estate {
  id: string;
  name: string;
  type: EstateType;
  address: string;
  description: string;
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  images: string[];
  cover: string;
  amenities: string[];
  rooms: Room[];
  reviews: Review[];
  host: { name: string; phone: string; whatsapp: string };
  checkIn: string;
  checkOut: string;
}
