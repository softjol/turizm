import { api } from "./client";
import { setTokens, clearTokens, getRefreshToken, type AuthTokens } from "./tokens";

/**
 * Types mirror the FastAPI Pydantic schemas in app/schemas/auth.py and
 * app/schemas/user.py. Keep them in sync if the backend changes.
 */

export type Role = "admin" | "reception" | "user";

// --- Request bodies --------------------------------------------------------

export interface RegisterRequest {
  name: string;
  whatsapp_phone_number: string;
  avatar_url?: string | null;
  language?: string | null;
}

export interface RequestOtpRequest {
  whatsapp_phone_number: string;
}

export interface VerifyOtpRequest {
  whatsapp_phone_number: string;
  /** 6-digit verification code. */
  code: string;
}

export interface GoogleAuthRequest {
  /** Google ID Token or Access Token. */
  token: string;
}

// --- Response bodies -------------------------------------------------------

/** TokenResponse — also the shape verify-otp / refresh / google return. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

/** UserResponse from GET /auth/me. */
export interface User {
  id: number;
  name: string;
  whatsapp_phone_number: string | null;
  email: string | null;
  google_id: string | null;
  role: Role;
  is_active: boolean;
  avatar_url: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}

// --- API functions ---------------------------------------------------------

export async function register(body: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/register", body);
  return data;
}

/** Sends an OTP to the given WhatsApp number. Returns the status message. */
export async function requestOtp(whatsapp_phone_number: string): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>("/auth/login/request-otp", {
    whatsapp_phone_number,
  } satisfies RequestOtpRequest);
  return data;
}

/**
 * Verifies the OTP, persists the returned tokens, and returns them.
 * After this resolves, `api` will automatically attach the access token.
 */
export async function verifyOtp(
  whatsapp_phone_number: string,
  code: string,
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login/verify-otp", {
    whatsapp_phone_number,
    code,
  } satisfies VerifyOtpRequest);
  setTokens(data as AuthTokens);
  return data;
}

export async function googleAuth(token: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/google", {
    token,
  } satisfies GoogleAuthRequest);
  setTokens(data as AuthTokens);
  return data;
}

/** Returns the currently authenticated user (requires a valid access token). */
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

/** Logs out on the backend (revokes the refresh token) and clears local tokens. */
export async function logout(): Promise<void> {
  const refresh_token = getRefreshToken();
  try {
    if (refresh_token) {
      await api.post("/auth/logout", { refresh_token });
    }
  } finally {
    clearTokens();
  }
}
