/**
 * Pure logic for the /register sign-in flow (no React, no server imports): maps better-auth errors to UI states
 * and holds the cooldown/validation helpers. Errors are mapped on `error.code`, never on message text or status alone
 * (the one exception is telling "declined" from "pending": both arrive as LUMA_NOT_APPROVED, only the message differs).
 */
import { authErrorText, otpVerifyErrorMessage } from "@/lib/auth/otp-messages";

export type AuthErrorLike = { status?: number; code?: string; message?: string } | null | undefined;

/** Guest-list outcomes shown as a calm notice on step 1. */
export type GuestListNotice = "notfound" | "pending" | "declined";

export function guestListNotice(error: AuthErrorLike): GuestListNotice | null {
  if (error?.status !== 403) return null;
  if (error.code === "NOT_ON_GUEST_LIST") return "notfound";
  if (error.code === "LUMA_NOT_APPROVED") {
    return /declined/i.test(error.message ?? "") ? "declined" : "pending";
  }
  return null;
}

export type VerifyOutcome =
  | { kind: "guest"; notice: GuestListNotice }
  | { kind: "invalid" | "expired" | "locked" }
  | { kind: "other"; text: string };

export function classifyVerifyError(error: AuthErrorLike, fallback: string): VerifyOutcome {
  const notice = guestListNotice(error);
  if (notice) return { kind: "guest", notice };
  switch (error?.code) {
    case "INVALID_OTP":
      return { kind: "invalid" };
    case "OTP_EXPIRED":
      return { kind: "expired" };
    case "TOO_MANY_ATTEMPTS":
      return { kind: "locked" };
    default:
      return { kind: "other", text: authErrorText(error, fallback) };
  }
}

/** Text for the three code-step error kinds (same strings PR #7 ships in lib/auth/otp-messages.ts). */
export function codeErrorText(kind: "invalid" | "expired" | "locked" | "short"): string {
  if (kind === "short") return COPY.codeShort;
  const map = { invalid: "INVALID_OTP", expired: "OTP_EXPIRED", locked: "TOO_MANY_ATTEMPTS" } as const;
  return otpVerifyErrorMessage(map[kind]) as string;
}

export const COPY = {
  emailInvalid: "Enter a valid email address, like you@example.com.",
  codeShort: "Enter all 6 digits from your email.",
  notfound: {
    title: "We can’t find that email on the guest list.",
    body: "No worries. This usually means you registered on Luma with a different address, so try that one. The event is invitation only: if you haven’t asked for a spot yet, you can request one on Luma and the organisers will approve guests there.",
    link: "Request an invitation on Luma",
  },
  pending: {
    title: "Your registration isn’t approved yet.",
    body: "You’re on Luma, but the organisers haven’t approved it yet. There’s no need to register again: once you’re approved, come back and sign in with this same email.",
    link: "Check your status on Luma",
  },
  declined: {
    title: "This email can’t sign in for this event.",
    body: "Your Luma registration wasn’t approved, so this address can’t sign in. If you registered with another address, try that one instead.",
    link: "Check your status on Luma",
  },
} as const;

/** Same shape the mockup validates with: something@something.tld, no spaces or list separators. */
export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/.test(value.trim());
}

/** Whole seconds left until `until` (epoch ms), never negative. Timestamp based, so background tabs stay correct. */
export function cooldownRemaining(until: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((until - now) / 1000));
}

/** 27 -> "0:27", 65 -> "1:05". */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
