import { describe, expect, it, vi } from "vitest";
import {
  EMAIL_LIMIT,
  IP_LIMIT,
  buildPortalAccessEmail,
  isSendableAddress,
  redactError,
  sendPortalAccessEmail,
  type PortalAccessEmailDeps,
} from "@/lib/auth/portal-access-email";
import { EVENT } from "@/lib/event";

function memoryDeps(overrides: Partial<PortalAccessEmailDeps> = {}) {
  const counts = new Map<string, number>();
  const sendEmail = vi.fn(async () => ({ ok: true }));
  const log = vi.fn();
  const deps: PortalAccessEmailDeps = {
    sendEmail,
    log,
    consume: async ({ kind, value }, _window, max) => {
      const key = `${kind}:${value}`;
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return next <= max;
    },
    ...overrides,
  };
  return { deps, sendEmail, log };
}

describe("portal access emails", () => {
  it("invites someone who is not registered, once, with the registration link and the same-email hint", async () => {
    const { deps, sendEmail } = memoryDeps();
    const input = { email: "New.Person@Example.com ", reason: "not_on_list" as const, ip: "203.0.113.5" };
    expect(await sendPortalAccessEmail(input, deps)).toBe("sent");
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const mail = sendEmail.mock.calls[0] as unknown as [{ to: string; subject: string; html: string }];
    expect(mail[0].to).toBe("new.person@example.com");
    expect(mail[0].html).toContain("https://luma.com/spacexai-z1ys");
    expect(mail[0].html).toContain("this same email address");
    expect(mail[0].html).toContain("Only registrants approved by the organisers can sign in");

    // Same address again (different case) inside 24 hours: rate limited, nothing is sent.
    expect(await sendPortalAccessEmail({ ...input, email: "new.person@example.com" }, deps)).toBe("throttled");
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("tells waitlisted / pending / invited guests they are not approved yet, without asking them to register again", async () => {
    const { deps, sendEmail } = memoryDeps();
    expect(await sendPortalAccessEmail({ email: "wait@example.com", reason: "not_approved", ip: null }, deps)).toBe("sent");
    const mail = (sendEmail.mock.calls[0] as unknown as [{ subject: string; html: string }])[0];
    expect(mail.subject).toContain("not approved yet");
    expect(mail.html).toContain("not approved yet");
    expect(mail.html).toContain("organisers will confirm your status by Luma");
    expect(mail.html).toContain("no need to register again");
    expect(mail.html).not.toContain("luma.com");
  });

  it("does not email declined guests", async () => {
    const { deps, sendEmail } = memoryDeps();
    expect(await sendPortalAccessEmail({ email: "no@example.com", reason: "declined", ip: "198.51.100.1" }, deps)).toBe("skipped");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("caps the number of emails per IP", async () => {
    const { deps, sendEmail } = memoryDeps();
    const outcomes: string[] = [];
    for (let i = 0; i < IP_LIMIT.max + 2; i += 1) {
      outcomes.push(await sendPortalAccessEmail({ email: `p${i}@example.com`, reason: "not_on_list", ip: "203.0.113.9" }, deps));
    }
    expect(outcomes.filter((o) => o === "sent")).toHaveLength(IP_LIMIT.max);
    expect(outcomes.slice(IP_LIMIT.max)).toEqual(["throttled", "throttled"]);
    expect(sendEmail).toHaveBeenCalledTimes(IP_LIMIT.max);
    // Another IP is unaffected.
    expect(await sendPortalAccessEmail({ email: "other@example.com", reason: "not_on_list", ip: "203.0.113.10" }, deps)).toBe("sent");
  });

  it("uses a 24 hour window per address and an hourly window per IP", () => {
    expect(EMAIL_LIMIT).toEqual({ windowSeconds: 86_400, max: 1 });
    expect(IP_LIMIT).toEqual({ windowSeconds: 3_600, max: 5 });
  });

  it("never sends to an address that fails validation", async () => {
    const { deps, sendEmail } = memoryDeps();
    for (const email of ["", "not-an-email", "a@b", "a b@example.com", "a@example.com,b@example.com", "a@example.com\r\nBcc: x@y.com", `${"x".repeat(250)}@example.com`, "<a@example.com>"]) {
      expect(await sendPortalAccessEmail({ email, reason: "not_on_list", ip: "203.0.113.1" }, deps)).toBe("skipped");
    }
    expect(sendEmail).not.toHaveBeenCalled();
    expect(isSendableAddress("ada@example.com")).toBe(true);
  });

  it("fails closed and quietly when the throttle store or the provider fails", async () => {
    const broken = memoryDeps({ consume: async () => { throw new Error('relation "email_throttle" does not exist'); } });
    expect(await sendPortalAccessEmail({ email: "a@example.com", reason: "not_on_list", ip: null }, broken.deps)).toBe("failed");
    expect(broken.sendEmail).not.toHaveBeenCalled();

    const rejected = memoryDeps({ sendEmail: vi.fn(async () => ({ ok: false, error: "domain not verified for a@example.com" })) });
    expect(await sendPortalAccessEmail({ email: "a@example.com", reason: "not_on_list", ip: null }, rejected.deps)).toBe("failed");
    expect(JSON.stringify(rejected.log.mock.calls)).not.toContain("a@example.com");
  });

  it("escapes the event name and keeps the copy short", () => {
    for (const reason of ["not_on_list", "not_approved"] as const) {
      const { html, subject } = buildPortalAccessEmail(reason);
      expect(subject).toContain(EVENT.name.slice(0, 5));
      expect(html.length).toBeLessThan(900);
    }
  });

  it("redacts addresses from provider errors", () => {
    expect(redactError('You can only send to me@x.io (me@x.io) {"to":"q@z.com"}')).not.toMatch(/@/);
  });
});
