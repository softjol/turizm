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
  email: string;
  password: string;
  avatar_url?: string | null;
  language?: string | null;
  role?: "user" | "reception";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  /** 6-digit verification code. */
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface GoogleAuthRequest {
  /** Google ID Token or Access Token. */
  token: string;
}

// --- Response bodies -------------------------------------------------------

/** TokenResponse - also the shape verify-email / refresh / google return. */
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

/**
 * Verifies the email-confirmation code sent at registration, persists the
 * returned tokens, and returns them.
 */
export async function verifyEmail(email: string, code: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/verify-email", {
    email,
    code,
  } satisfies VerifyEmailRequest);
  setTokens(data as AuthTokens);
  return data;
}

/** Resends the email-confirmation code. */
export async function resendCode(email: string): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>("/auth/resend-code", {
    email,
  } satisfies ResendCodeRequest);
  return data;
}

/**
 * Logs in with email + password, persists the returned tokens, and returns them.
 * After this resolves, `api` will automatically attach the access token.
 */
export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login", {
    email,
    password,
  } satisfies LoginRequest);
  setTokens(data as AuthTokens);
  return data;
}

export async function googleAuth(token: string, role: "user" | "reception" = "user"): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/google", {
    token,
    role,
  } satisfies GoogleAuthRequest);
  setTokens(data as AuthTokens);
  return data;
}

/** Returns the currently authenticated user (requires a valid access token). */
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export interface UpdateMeRequest {
  name?: string;
  whatsapp_phone_number?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

/** Update the current user's own profile (name / phone / email / avatar). */
export async function updateMe(body: UpdateMeRequest): Promise<User> {
  const { data } = await api.patch<User>("/auth/me", body);
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
