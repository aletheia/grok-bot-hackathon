import { describe, expect, it, vi } from "vitest";
import { checkGithubRepoPublic } from "@/lib/submissions/github";

const res = (status: number, body: unknown = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

describe("checkGithubRepoPublic", () => {
  it("calls the unauthenticated repos endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, { private: false, visibility: "public" }));
    await expect(checkGithubRepoPublic("acme", "robot-dog", { fetchImpl })).resolves.toBe("public");
    expect(fetchImpl.mock.calls[0]![0]).toBe("https://api.github.com/repos/acme/robot-dog");
    expect(JSON.stringify(fetchImpl.mock.calls[0]![1])).not.toMatch(/authorization/i);
  });
  it("404 means private or missing", async () => {
    await expect(checkGithubRepoPublic("a", "b", { fetchImpl: async () => res(404) })).resolves.toBe("not_public");
  });
  it("private flag means not public", async () => {
    await expect(checkGithubRepoPublic("a", "b", { fetchImpl: async () => res(200, { private: true }) })).resolves.toBe("not_public");
  });
  it("fails soft on rate limits, server errors and network errors", async () => {
    await expect(checkGithubRepoPublic("a", "b", { fetchImpl: async () => res(403) })).resolves.toBe("unknown");
    await expect(checkGithubRepoPublic("a", "b", { fetchImpl: async () => res(429) })).resolves.toBe("unknown");
    await expect(checkGithubRepoPublic("a", "b", { fetchImpl: async () => res(502) })).resolves.toBe("unknown");
    await expect(
      checkGithubRepoPublic("a", "b", {
        fetchImpl: async () => {
          throw new Error("offline");
        },
      }),
    ).resolves.toBe("unknown");
  });
});
