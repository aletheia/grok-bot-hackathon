import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listVotesForJuror = vi.fn();
const upsertJuryVotes = vi.fn();

vi.mock("@/lib/vote/service", () => ({
  listVotesForJuror: (...args: unknown[]) => listVotesForJuror(...args),
  upsertJuryVotes: (...args: unknown[]) => upsertJuryVotes(...args),
}));

import { GET, PUT } from "./route";

describe("/api/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads one juror's scores with no login", async () => {
    listVotesForJuror.mockResolvedValue({
      jurorName: "Ada",
      scores: [{ teamId: 4, innovation: 5, scalability: 4, marketReadiness: 3 }],
    });

    const response = await GET(new NextRequest("http://localhost/api/vote?juror=Ada"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(listVotesForJuror).toHaveBeenCalledWith("Ada");
    expect(body.data.scores).toEqual([{ teamId: 4, innovation: 5, scalability: 4, marketReadiness: 3 }]);
  });

  it("upserts the posted scores", async () => {
    const saved = { jurorName: "Ada", scores: [{ teamId: 4, innovation: 2, scalability: 3, marketReadiness: 4 }] };
    upsertJuryVotes.mockResolvedValue(saved);

    const response = await PUT(
      new NextRequest("http://localhost/api/vote", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jurorName: "Ada",
          scores: [{ teamId: 4, innovation: 2, scalability: 3, marketReadiness: 4 }],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(upsertJuryVotes).toHaveBeenCalledWith("Ada", [
      { teamId: 4, innovation: 2, scalability: 3, marketReadiness: 4 },
    ]);
    expect(body.data).toEqual(saved);
  });
});
