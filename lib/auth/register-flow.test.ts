import { describe, expect, it } from "vitest";
import {
  COPY,
  classifyVerifyError,
  codeErrorText,
  cooldownRemaining,
  formatCountdown,
  guestListNotice,
  isPlausibleEmail,
} from "@/lib/auth/register-flow";
import { DECLINED_MESSAGE, NOT_APPROVED_MESSAGE, NOT_ON_GUEST_LIST_MESSAGE } from "@/lib/luma/allowlist";

describe("guestListNotice (maps on error.code)", () => {
  it("NOT_ON_GUEST_LIST -> notfound", () => {
    expect(guestListNotice({ status: 403, code: "NOT_ON_GUEST_LIST", message: NOT_ON_GUEST_LIST_MESSAGE })).toBe("notfound");
  });

  it("LUMA_NOT_APPROVED -> pending, or declined when the server message says so", () => {
    expect(guestListNotice({ status: 403, code: "LUMA_NOT_APPROVED", message: NOT_APPROVED_MESSAGE })).toBe("pending");
    expect(guestListNotice({ status: 403, code: "LUMA_NOT_APPROVED", message: DECLINED_MESSAGE })).toBe("declined");
    expect(guestListNotice({ status: 403, code: "LUMA_NOT_APPROVED" })).toBe("pending");
  });

  it("ignores everything else, including a 403 with another code", () => {
    expect(guestListNotice({ status: 403, code: "TOO_MANY_ATTEMPTS" })).toBeNull();
    expect(guestListNotice({ status: 429 })).toBeNull();
    expect(guestListNotice({ status: 500, code: "EMAIL_SEND_FAILED" })).toBeNull();
    expect(guestListNotice(null)).toBeNull();
    expect(guestListNotice(undefined)).toBeNull();
  });
});

describe("classifyVerifyError", () => {
  it("maps the three OTP codes", () => {
    expect(classifyVerifyError({ status: 400, code: "INVALID_OTP", message: "Invalid OTP" }, "x")).toEqual({ kind: "invalid" });
    expect(classifyVerifyError({ status: 400, code: "OTP_EXPIRED", message: "OTP expired" }, "x")).toEqual({ kind: "expired" });
    // TOO_MANY_ATTEMPTS arrives as 403: the code wins over the status.
    expect(classifyVerifyError({ status: 403, code: "TOO_MANY_ATTEMPTS", message: "Too many attempts" }, "x")).toEqual({ kind: "locked" });
  });

  it("a guest-list 403 at the code step sends the user back to step 1", () => {
    expect(classifyVerifyError({ status: 403, code: "NOT_ON_GUEST_LIST" }, "x")).toEqual({ kind: "guest", notice: "notfound" });
    expect(classifyVerifyError({ status: 403, code: "LUMA_NOT_APPROVED", message: DECLINED_MESSAGE }, "x")).toEqual({
      kind: "guest",
      notice: "declined",
    });
  });

  it("everything else keeps the PR #7 text (429 copy, server message, fallback)", () => {
    expect(classifyVerifyError({ status: 429 }, "x")).toEqual({ kind: "other", text: "Please wait a moment before requesting another code." });
    expect(classifyVerifyError({ status: 500, message: " Boom " }, "x")).toEqual({ kind: "other", text: "Boom" });
    expect(classifyVerifyError({}, "fallback")).toEqual({ kind: "other", text: "fallback" });
  });
});

describe("copy", () => {
  it("code errors use the approved strings", () => {
    expect(codeErrorText("invalid")).toBe("That code isn't right. Use the newest code from your latest email, or request a new one.");
    expect(codeErrorText("expired")).toBe("That code has expired. Request a new one.");
    expect(codeErrorText("locked")).toBe("Too many attempts. Request a new code.");
    expect(codeErrorText("short")).toBe("Enter all 6 digits from your email.");
  });

  it("guest-list notices are calm: a title, a body and a Luma link label, no blame wording", () => {
    for (const key of ["notfound", "pending", "declined"] as const) {
      const c = COPY[key];
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(0);
      expect(c.link.length).toBeGreaterThan(0);
      expect(`${c.title} ${c.body}`).not.toMatch(/\b(error|failed|invalid|denied|rejected)\b/i);
    }
    expect(COPY.notfound.link).toBe("Request an invitation on Luma");
  });
});

describe("isPlausibleEmail", () => {
  it("accepts normal addresses and rejects obvious typos", () => {
    expect(isPlausibleEmail(" maya.rossi@example.com ")).toBe(true);
    expect(isPlausibleEmail("maya@example")).toBe(false);
    expect(isPlausibleEmail("maya example@x.com")).toBe(false);
    expect(isPlausibleEmail("a@b.com, c@d.com")).toBe(false);
    expect(isPlausibleEmail("")).toBe(false);
  });
});

describe("cooldown helpers", () => {
  it("counts down from a timestamp, never below zero", () => {
    expect(cooldownRemaining(30_000, 0)).toBe(30);
    expect(cooldownRemaining(30_000, 2_500)).toBe(28);
    expect(cooldownRemaining(30_000, 30_000)).toBe(0);
    expect(cooldownRemaining(30_000, 90_000)).toBe(0);
    expect(cooldownRemaining(0, 1_000)).toBe(0);
  });

  it("formats m:ss", () => {
    expect(formatCountdown(27)).toBe("0:27");
    expect(formatCountdown(5)).toBe("0:05");
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(-3)).toBe("0:00");
  });
});
