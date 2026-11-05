import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: {} }));

import { saveMyTeamSubmission, submissionsToCsv } from "@/lib/submissions/service";
import type { AppSessionUser } from "@/lib/auth/session";

const actor = { id: "u1", name: "Ada", email: "ada@example.com", teamId: 1, isTeamLead: false } as AppSessionUser;
const OPEN = new Date("2026-11-05T12:00:00+01:00");

async function failure(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    return e as { status: number; code: string; details?: { field?: string } };
  }
  throw new Error("expected an error");
}

describe("saveMyTeamSubmission validation (before touching the database)", () => {
  it("refuses after 16:00 Rome", async () => {
    const e = await failure(saveMyTeamSubmission(actor, { githubUrl: "https://github.com/a/b" }, { now: new Date("2026-11-05T16:00:01+01:00") }));
    expect([e.status, e.code]).toEqual([403, "SUBMISSIONS_CLOSED"]);
  });
  it("requires a github.com repository URL", async () => {
    for (const githubUrl of [undefined, "", "https://gitlab.com/a/b", 42]) {
      const e = await failure(saveMyTeamSubmission(actor, { githubUrl }, { now: OPEN }));
      expect([e.status, e.code, e.details?.field]).toEqual([400, "INVALID_GITHUB_URL", "githubUrl"]);
    }
  });
  it("rejects a malformed video link", async () => {
    const e = await failure(saveMyTeamSubmission(actor, { githubUrl: "https://github.com/a/b", videoUrl: "not a link" }, { now: OPEN }));
    expect([e.status, e.code, e.details?.field]).toEqual([400, "INVALID_VIDEO_URL", "videoUrl"]);
  });
});

describe("submissionsToCsv", () => {
  it("writes one row per team with members, links and Rome time, escaping and neutralising formulas", () => {
    const csv = submissionsToCsv(
      [
        {
          teamId: 7,
          teamName: 'Dogs, "robotic"',
          members: [
            { userId: "1", name: "Ada", email: "ada@x.com", role: "lead" },
            { userId: "2", name: "=HYPERLINK()", email: "bob@x.com", role: "member" },
          ],
          githubUrl: "https://github.com/a/b",
          videoUrl: null,
          updatedAt: "2026-11-05T14:30:00.000Z",
          updatedByName: "Ada",
        },
        { teamId: 8, teamName: "=cmd()", members: [], githubUrl: null, videoUrl: null, updatedAt: null, updatedByName: null },
      ],
      () => "5 Nov 2026, 15:30",
    );
    const lines = csv.replace(/^\uFEFF/, "").trim().split("\r\n");
    expect(lines[0]).toBe("Team ID,Team name,Members,Member emails,GitHub repository,Video link,Last updated (Rome time),Saved by");
    expect(lines[1]).toBe('7,"Dogs, ""robotic""",Ada; =HYPERLINK(),ada@x.com; bob@x.com,https://github.com/a/b,,"5 Nov 2026, 15:30",Ada');
    expect(lines[2]).toBe("8,'=cmd(),,,,,,");
  });
});
