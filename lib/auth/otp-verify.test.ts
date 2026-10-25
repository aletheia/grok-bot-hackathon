import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sendEmail: vi.fn() }));

// The user/session hooks only run `select().from().where().limit()` lookups; an empty result is enough here.
vi.mock("@/db", () => {
  const chain: Record<string, unknown> = {};
  for (const name of ["select", "from", "where", "limit"]) chain[name] = () => chain;
  chain.then = (resolve: (rows: unknown[]) => void) => resolve([]);
  return { db: chain };
});
vi.mock("better-auth/adapters/drizzle", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory");
  return { drizzleAdapter: () => memoryAdapter({ user: [], account: [], session: [], verification: [], twoFactor: [] }) };
});
vi.mock("@/lib/email/send", () => ({ sendEmail: state.sendEmail }));
vi.mock("@/lib/luma/service", () => ({
  checkPortalSignIn: async () => ({ allowed: true, reason: "guest_list" }),
  getSuperAdminEmails: () => new Set<string>(),
}));
vi.mock("@/lib/auth/email-throttle", () => ({
  throttleKey: (ns: string, value: string) => `${ns}:${value}`,
  consumeThrottle: async () => true,
}));

process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
process.env.BETTER_AUTH_URL = "http://localhost:3000";

const { auth } = await import("@/lib/auth");

const headers = { "content-type": "application/json", origin: "http://localhost:3000" };
const send = (email: string) =>
  auth.handler(
    new Request("http://localhost:3000/api/auth/email-otp/send-verification-otp", {
      method: "POST",
      headers,
      body: JSON.stringify({ email, type: "sign-in" }),
    }),
  );
const verify = (email: string, otp: string) =>
  auth.handler(
    new Request("http://localhost:3000/api/auth/sign-in/email-otp", {
      method: "POST",
      headers,
      body: JSON.stringify({ email, otp }),
    }),
  );
const codes = () => state.sendEmail.mock.calls.map((c) => (c[0] as { subject: string }).subject.slice(0, 6));
const wrongCode = (real: string) => (real === "000000" ? "111111" : "000000");

let counter = 0;
let email = "";

beforeEach(() => {
  state.sendEmail.mockReset();
  state.sendEmail.mockResolvedValue({ ok: true });
  counter += 1;
  email = `person${counter}@example.com`;
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("sign-in code lifecycle through better-auth", () => {
  it("one send produces exactly one email and its code signs in (typed email in any case)", async () => {
    expect((await send(email)).status).toBe(200);
    expect(state.sendEmail).toHaveBeenCalledTimes(1);
    expect((await verify(email.toUpperCase(), codes()[0])).status).toBe(200);
    expect(state.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("only the newest code works: a second send replaces the first", async () => {
    await send(email);
    await send(email);
    const [first, second] = codes();
    expect(first).not.toBe(second);
    const stale = await verify(email, first);
    expect(stale.status).toBe(400);
    expect(await stale.json()).toMatchObject({ code: "INVALID_OTP" });
    expect((await verify(email, second)).status).toBe(200);
  });

  it("a wrong code does not burn the right one", async () => {
    await send(email);
    const [real] = codes();
    expect((await verify(email, wrongCode(real))).status).toBe(400);
    expect((await verify(email, real)).status).toBe(200);
  });

  it("answers 403 TOO_MANY_ATTEMPTS after five wrong codes, and a new code recovers", async () => {
    await send(email);
    const [real] = codes();
    for (let i = 0; i < 5; i += 1) expect((await verify(email, wrongCode(real))).status).toBe(400);
    const locked = await verify(email, real);
    expect(locked.status).toBe(403);
    expect(await locked.json()).toMatchObject({ code: "TOO_MANY_ATTEMPTS" });
    await send(email);
    expect((await verify(email, codes()[1])).status).toBe(200);
  });

  it("logs only the rejection reason, never the address or a code", async () => {
    await send(email);
    const [real] = codes();
    await verify(email, wrongCode(real));
    const logged = JSON.stringify((console.warn as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).toContain("sign-in code rejected: INVALID_OTP (400)");
    expect(logged).not.toContain(email);
    expect(logged).not.toContain(real);
  });
});
