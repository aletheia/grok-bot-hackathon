import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/vote/service", () => ({
  listVoteProjects: vi.fn(async () => [
    {
      id: 7,
      name: "aidea",
      githubUrl: "https://github.com/aidea-team/grokbot-hackathon",
      videoUrl: "https://drive.google.com/file/d/1O07pps3oms5QT0K9nCZ4UABmgjicWS7l/view?usp=sharing",
    },
  ]),
}));

import { GET } from "./route";

describe("GET /api/vote/projects", () => {
  it("returns submitted projects and no member fields", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.projects).toEqual([
      {
        id: 7,
        name: "aidea",
        githubUrl: "https://github.com/aidea-team/grokbot-hackathon",
        videoUrl: "https://drive.google.com/file/d/1O07pps3oms5QT0K9nCZ4UABmgjicWS7l/view?usp=sharing",
      },
    ]);
    expect(JSON.stringify(body)).not.toMatch(/email|joinCode|join_code/i);
  });
});
