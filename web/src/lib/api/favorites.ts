import type { Estate } from "@/lib/mock-data";
import { getEstate } from "./estates";

// --- Favorites -------------------------------------------------------------
//
// The backend has no favorites endpoint, so favorites live client-side in
// localStorage (same approach as "my hotels" in hotels.ts). We store hotel ids
// and reload the estates from the API on demand.

const FAVORITES_KEY = "meiman.favorite_hotel_ids";

export function getFavoriteIds(): number[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === "number") : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: number): boolean {
  return getFavoriteIds().includes(id);
}

/** Add/remove a hotel id; returns the new favorite state (true = now favorited). */
export function toggleFavorite(id: number): boolean {
  const ids = getFavoriteIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }
  return next.includes(id);
}

/** Load all favorited hotels as Estates (newest first). Skips any that 404. */
export async function getFavoriteEstates(): Promise<Estate[]> {
  const ids = getFavoriteIds();
  const results = await Promise.allSettled(ids.map((id) => getEstate(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Estate> => r.status === "fulfilled")
    .map((r) => r.value)
    .reverse();
}
