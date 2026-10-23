import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppUrl, getVercelOrigins } from "@/lib/app-url";

afterEach(() => vi.unstubAllEnvs());

function env(vars: Record<string, string | undefined>) {
  for (const key of ["BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    vi.stubEnv(key, vars[key] ?? "");
  }
}

describe("getAppUrl", () => {
  it("prefers explicit BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL", () => {
    env({ BETTER_AUTH_URL: "https://grok-hackathon-pavia.vercel.app/", VERCEL_ENV: "preview", VERCEL_URL: "x.vercel.app" });
    expect(getAppUrl()).toBe("https://grok-hackathon-pavia.vercel.app");
  });

  it("uses the branch URL on Vercel previews, then the deployment URL", () => {
    env({ VERCEL_ENV: "preview", VERCEL_URL: "p-abc.vercel.app", VERCEL_BRANCH_URL: "p-git-feat.vercel.app" });
    expect(getAppUrl()).toBe("https://p-git-feat.vercel.app");
    env({ VERCEL_ENV: "preview", VERCEL_URL: "p-abc.vercel.app" });
    expect(getAppUrl()).toBe("https://p-abc.vercel.app");
  });

  it("uses the production domain in Vercel production and localhost otherwise", () => {
    env({ VERCEL_ENV: "production", VERCEL_URL: "p-abc.vercel.app", VERCEL_PROJECT_PRODUCTION_URL: "p.vercel.app" });
    expect(getAppUrl()).toBe("https://p.vercel.app");
    env({});
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("lists all Vercel origins as trusted", () => {
    env({ VERCEL_URL: "a.vercel.app", VERCEL_BRANCH_URL: "b.vercel.app" });
    expect(getVercelOrigins()).toEqual(["https://a.vercel.app", "https://b.vercel.app"]);
  });
});
