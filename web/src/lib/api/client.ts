import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokens";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // Surfaced loudly in dev so a missing .env is obvious instead of failing
  // with confusing relative-URL 404s.
  console.error(
    "[api] VITE_API_URL is not set. Create a .env file with " +
      "VITE_API_URL=http://localhost:8000/api/v1 and restart the dev server.",
  );
}

/** Route to redirect to when the session can no longer be refreshed. */
const LOGIN_ROUTE = "/auth";

/**
 * The shared API client. Import this everywhere instead of calling axios
 * directly so the base URL + auth handling stay in one place.
 */
export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// --- Request interceptor: attach the access token when present -------------

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// --- Response interceptor: refresh-on-401 with single-flight + one retry ---

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

// Bare axios instance for the refresh call so it does NOT go through the
// interceptors above (which would recurse on its own 401).
const refreshClient = axios.create({ baseURL });

// Holds the in-flight refresh so concurrent 401s share one network call.
let refreshPromise: Promise<string> | null = null;

function redirectToLogin(): void {
  clearTokens();
  if (typeof window !== "undefined" && window.location.pathname !== LOGIN_ROUTE) {
    window.location.assign(LOGIN_ROUTE);
  }
}

async function refreshAccessToken(): Promise<string> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error("No refresh token");

  const { data } = await refreshClient.post<RefreshResponse>("/auth/refresh", {
    refresh_token,
  });
  setTokens(data);
  return data.access_token;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const isAuthRefreshCall = original?.url?.includes("/auth/refresh");

    // Only attempt a refresh for a genuine 401 that we haven't already retried,
    // and never for the refresh call itself.
    if (status === 401 && original && !original._retry && !isAuthRefreshCall) {
      original._retry = true;
      try {
        // Single-flight: the first 401 starts the refresh; the rest await it.
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newAccessToken = await refreshPromise;
        original.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return api(original);
      } catch (refreshError) {
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  },
);
