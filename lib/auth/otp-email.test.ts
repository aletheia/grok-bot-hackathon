import { describe, expect, it } from "vitest";
import { buildSignInCodeEmail, OTP_EMAIL_SUBJECT } from "@/lib/auth/otp-delivery";
import { buildPortalAccessEmail } from "@/lib/auth/portal-access-email";

describe("buildSignInCodeEmail", () => {
  const mail = buildSignInCodeEmail("123456");

  it("uses the exact subject and keeps the code out of it", () => {
    expect(OTP_EMAIL_SUBJECT).toBe("Grok Bot Hackathon Pavia");
    expect(mail.subject).toBe("Grok Bot Hackathon Pavia");
  });

  it("puts the code on its own line in the plain-text body", () => {
    expect(mail.text.split("\n")).toContain("123456");
  });

  it("puts the code in its own monospace element in the HTML body", () => {
    expect(mail.html).toMatch(/<p style="[^"]*monospace[^"]*">123456<\/p>/);
  });

  it("escapes the code in HTML", () => {
    expect(buildSignInCodeEmail("<b>").html).not.toContain("<b>");
  });

  it("does not change the subjects of the guest invite/status emails", () => {
    expect(buildPortalAccessEmail("not_on_list").subject).not.toBe(OTP_EMAIL_SUBJECT);
    expect(buildPortalAccessEmail("not_approved").subject).not.toBe(OTP_EMAIL_SUBJECT);
  });
});
