import { api } from "./client";

export interface HealthResponse {
  status: string;
}

/**
 * The health check lives at the server root (GET /health), NOT under the
 * /api/v1 prefix that `api` is configured with. Derive the backend origin from
 * VITE_API_URL so we hit http://localhost:8000/health regardless of the prefix.
 */
function healthUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? "";
  try {
    return new URL("/health", base).toString();
  } catch {
    return "/health";
  }
}

/**
 * Connectivity smoke test. Calls GET /health on the backend and logs the
 * outcome so you can confirm in the browser console / network tab that the
 * frontend can reach FastAPI.
 */
export async function pingBackend(): Promise<HealthResponse | null> {
  try {
    // Absolute URL → axios ignores baseURL and hits the server root.
    const { data } = await api.get<HealthResponse>(healthUrl());
    console.info("[api] ✅ backend reachable — GET /health:", data);
    return data;
  } catch (error) {
    console.error("[api] ❌ backend unreachable — GET /health failed:", error);
    return null;
  }
}
