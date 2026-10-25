import { describe, expect, it } from "vitest";
import {
  OTP_EXPIRED_MESSAGE,
  OTP_INVALID_MESSAGE,
  OTP_TOO_MANY_ATTEMPTS_MESSAGE,
  authErrorText,
  otpVerifyErrorMessage,
  sanitizeOtp,
} from "@/lib/auth/otp-messages";

describe("otpVerifyErrorMessage", () => {
  it("uses the approved copy", () => {
    expect(otpVerifyErrorMessage("INVALID_OTP")).toBe(
      "That code isn't right. Use the newest code from your latest email, or request a new one.",
    );
    expect(otpVerifyErrorMessage("OTP_EXPIRED")).toBe("That code has expired. Request a new one.");
    expect(otpVerifyErrorMessage("TOO_MANY_ATTEMPTS")).toBe("Too many attempts. Request a new code.");
    expect(OTP_INVALID_MESSAGE).not.toBe(OTP_EXPIRED_MESSAGE);
    expect(OTP_TOO_MANY_ATTEMPTS_MESSAGE).toMatch(/new code/);
  });

  it("returns null for anything else so the caller keeps its own message", () => {
    expect(otpVerifyErrorMessage("NOT_ON_GUEST_LIST")).toBeNull();
    expect(otpVerifyErrorMessage(undefined)).toBeNull();
  });
});

describe("sanitizeOtp", () => {
  it("strips whitespace and non-digits and caps at six digits", () => {
    expect(sanitizeOtp(" 123 456 ")).toBe("123456");
    expect(sanitizeOtp("123-456")).toBe("123456");
    expect(sanitizeOtp("12\u00a03456\n")).toBe("123456");
    expect(sanitizeOtp("abc")).toBe("");
    expect(sanitizeOtp("1234567890")).toBe("123456");
  });
});

describe("authErrorText", () => {
  it("maps on error.code, not on the HTTP status", () => {
    expect(authErrorText({ status: 403, code: "TOO_MANY_ATTEMPTS", message: "Too many attempts" }, "x")).toBe(
      "Too many attempts. Request a new code.",
    );
    expect(authErrorText({ status: 400, code: "INVALID_OTP", message: "Invalid OTP" }, "x")).toMatch(/isn't right/);
    expect(authErrorText({ status: 400, code: "OTP_EXPIRED", message: "OTP expired" }, "x")).toMatch(/expired/);
  });

  it("429 does not promise a minute and matches the 30 s cooldown", () => {
    const text = authErrorText({ status: 429 }, "x");
    expect(text).toBe("Please wait a moment before requesting another code.");
    expect(text).not.toMatch(/minute/i);
  });

  it("falls back to the server message, then the fallback", () => {
    expect(authErrorText({ status: 403, code: "NOT_ON_GUEST_LIST", message: " Not on the list. " }, "x")).toBe("Not on the list.");
    expect(authErrorText({}, "fallback")).toBe("fallback");
    expect(authErrorText(null, "fallback")).toBe("fallback");
  });
});
