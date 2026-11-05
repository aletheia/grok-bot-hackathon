import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/vote/migrate", () => ({
  ensureMigrations: vi.fn(async () => undefined),
}));

const select = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => select(...args),
    transaction: vi.fn(),
  },
}));

import { upsertJuryVotes } from "./service";

describe("upsertJuryVotes validation", () => {
  beforeEach(() => {
    select.mockReset();
    select.mockImplementation(() => {
      throw new Error("database should not be queried for an invalid ballot");
    });
  });

  it("requires a name before touching the database", async () => {
    await expect(upsertJuryVotes("  ", [{ teamId: 1, innovation: 1, scalability: 1, marketReadiness: 1 }])).rejects.toMatchObject({
      status: 400,
      code: "INVALID_JUROR",
    });
  });

  it("rejects a zero score before touching the database", async () => {
    await expect(upsertJuryVotes("Ada", [{ teamId: 1, innovation: 0, scalability: 1, marketReadiness: 1 }])).rejects.toMatchObject({
      status: 400,
      code: "INVALID_SCORES",
    });
  });
});
