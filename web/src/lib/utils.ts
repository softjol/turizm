import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Rolling default check-in/check-out dates (tomorrow, +3 nights).
 * Must stay relative to "now" - a fixed calendar date would let one real
 * booking permanently block that room for every visitor who doesn't
 * touch the date picker.
 */
export function defaultStayDates(): { checkIn: string; checkOut: string } {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 4);
  return { checkIn: toIsoDate(checkIn), checkOut: toIsoDate(checkOut) };
}
