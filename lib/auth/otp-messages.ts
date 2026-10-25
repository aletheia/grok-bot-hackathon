/** Client-safe constants (no server imports) shared by the auth hooks and the sign-in page. */
export const OTP_SEND_FAILED_CODE = "EMAIL_SEND_FAILED";
export const OTP_SEND_FAILED_MESSAGE =
  "We could not send the code. Please try again later or contact the organisers.";

export const OTP_INVALID_MESSAGE =
  "That code isn't right. Use the newest code from your latest email, or request a new one.";
export const OTP_EXPIRED_MESSAGE = "That code has expired. Request a new one.";
export const OTP_TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts. Request a new code.";
export const OTP_LATEST_ONLY_HINT = "Only the latest code works. Each new email replaces the previous one.";

/** Seconds the "Send a new code" button stays disabled after a code was sent. */
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/** Friendly text for the verify step, keyed by better-auth's error code; null when the code is not an OTP error. */
export function otpVerifyErrorMessage(code: string | undefined | null): string | null {
  switch (code) {
    case "INVALID_OTP":
      return OTP_INVALID_MESSAGE;
    case "OTP_EXPIRED":
      return OTP_EXPIRED_MESSAGE;
    case "TOO_MANY_ATTEMPTS":
      return OTP_TOO_MANY_ATTEMPTS_MESSAGE;
    default:
      return null;
  }
}

/** Keeps digits only (pasted codes often carry spaces or dashes) and at most six of them. */
export function sanitizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export const OTP_RATE_LIMITED_MESSAGE = "Please wait a moment before requesting another code.";

/**
 * Text for any failed auth call on the sign-in page. Known better-auth codes win over the HTTP status
 * (TOO_MANY_ATTEMPTS arrives as 403, the rate limiter as 429), then the server message, then the fallback.
 */
export function authErrorText(error: unknown, fallback: string): string {
  const err = error as { message?: string; status?: number; code?: string } | null;
  const byCode = otpVerifyErrorMessage(err?.code);
  if (byCode) return byCode;
  if (err?.status === 429) return OTP_RATE_LIMITED_MESSAGE;
  return err?.message?.trim() || fallback;
}
