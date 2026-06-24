/**
 * Single source of truth for auth token persistence.
 *
 * Tokens live in localStorage for now. If we later move to cookies or an
 * in-memory store, this is the only file that needs to change.
 */

const ACCESS_TOKEN_KEY = "turizm.access_token";
const REFRESH_TOKEN_KEY = "turizm.refresh_token";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export function getAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
