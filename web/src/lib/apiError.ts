import { isAxiosError } from "axios";

type TFunc = (key: string, vars?: Record<string, string | number>) => string;

interface Matcher {
  test: RegExp;
  key: string;
  vars?: (m: RegExpMatchArray) => Record<string, string | number>;
}

/**
 * Backend (FastAPI) sends English `detail` strings. This maps the known ones
 * to translated i18n keys so the UI never shows raw English error text.
 * Order matters where patterns could otherwise overlap.
 */
const matchers: Matcher[] = [
  { test: /^Room (.+) is occupied or unavailable for the selected dates$/, key: "err.roomOccupied", vars: (m) => ({ room: m[1] }) },
  { test: /^Room is occupied or unavailable for the selected dates$/, key: "err.roomOccupiedGeneric" },
  { test: /^Selected room\(s\) fit up to (\d+) guests total, but (\d+) were requested$/, key: "err.capacityExceeded", vars: (m) => ({ capacity: m[1], guests: m[2] }) },
  { test: /^Duplicate room_ids in request$/, key: "err.duplicateRooms" },
  { test: /^Room (.+) does not belong to this hotel$/, key: "err.roomNotInHotel" },
  { test: /^Room( \S+)? not found$/, key: "err.roomNotFound" },
  { test: /^Check-out date must be after check-in date$/, key: "err.dateOrder" },
  { test: /^All rooms in a single booking must belong to the same hotel$/, key: "err.roomsDifferentHotels" },
  { test: /^Booking not found( or access denied)?$/, key: "err.bookingNotFound" },
  { test: /^Cannot (confirm|reject|cancel) booking in status /, key: "err.cannotChangeStatus" },
  { test: /^Cannot check in without confirmation$/, key: "err.cannotCheckIn" },
  { test: /^Cannot check out a guest that is not checked in$/, key: "err.cannotCheckOut" },
  { test: /^Username already taken$/, key: "err.usernameTaken" },
  { test: /^Email already (registered|in use)$/, key: "err.emailRegistered" },
  { test: /^Phone number already in use$/, key: "err.phoneInUse" },
  { test: /^Email not registered\. Please register first\.$/, key: "err.emailNotRegistered" },
  { test: /^Email is already verified$/, key: "err.emailAlreadyVerified" },
  { test: /^Code expired or not found\. Request a new one\.$/, key: "err.codeExpired" },
  { test: /^Too many attempts\. Request a new code\.$/, key: "err.tooManyAttempts" },
  { test: /^Invalid code$/, key: "err.invalidCode" },
  { test: /^Invalid email or password$/, key: "err.invalidCredentials" },
  { test: /^Email not verified or account blocked$/, key: "err.emailNotVerifiedOrBlocked" },
  { test: /^(Invalid token( type or signature| payload)?|Invalid refresh token( payload)?|Refresh token (revoked or not found|expired))$/, key: "err.sessionExpired" },
  { test: /^User not found$/, key: "err.userNotFound" },
  { test: /^Permission denied/, key: "err.permissionDenied" },
  { test: /^Hotel not found$/, key: "err.hotelNotFound" },
  { test: /^Amenity with id .+ not found$/, key: "err.amenityNotFound" },
  { test: /^Image not found for this (room|hotel)$/, key: "err.imageNotFound" },
  { test: /^Complaint not found$/, key: "err.complaintNotFound" },
  { test: /^Cannot review a booking that is not completed$/, key: "err.reviewNotCompleted" },
  { test: /^Review already exists for this booking$/, key: "err.reviewExists" },
  { test: /^Review not found$/, key: "err.reviewNotFound" },
  { test: /^image_ids must match the hotel's current set of images$/, key: "err.imageIdsMismatch" },
  { test: /^Payment not found$/, key: "err.paymentNotFound" },
  { test: /^Invalid payload$/, key: "err.invalidPayload" },
];

/** Extracts the raw `detail` string from an axios error's response body, if any. */
export function getRawApiErrorDetail(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined;
  const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
  return typeof detail === "string" ? detail : undefined;
}

/**
 * Translates a backend error into a user-facing message in the current
 * language. Falls back to `fallbackKey` (default "err.generic") when the
 * error has no recognizable `detail`, or to the axios/JS error message when
 * the request never reached the backend (network error, etc).
 */
export function translateApiError(err: unknown, t: TFunc, fallbackKey = "err.generic"): string {
  const detail = getRawApiErrorDetail(err);
  if (detail) {
    for (const m of matchers) {
      const match = detail.match(m.test);
      if (match) return t(m.key, m.vars ? m.vars(match) : undefined);
    }
  }
  if (isAxiosError(err) && !err.response) {
    // Request never reached the server (offline, DNS, CORS, timeout, ...).
    return t("err.network");
  }
  return t(fallbackKey);
}
