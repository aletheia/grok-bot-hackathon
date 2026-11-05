import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TEAM_LOCK_AT } from "@/lib/teams/rules";
import { REGISTRATION_CLOSES_AT } from "@/lib/registration";
import {
  findMemberEmailProblems,
  formatCountdown,
  formatSubmissionDeadlineShort,
  formatSubmissionDeadlineTime,
  getSubmissionStatus,
  isSubmissionClosed,
  parseGithubRepoUrl,
  parseVideoUrl,
  SUBMISSION_DEADLINE_AT,
} from "@/lib/submissions/rules";

describe("submission deadline", () => {
  it("is 5 Nov 2026 16:30 Rome (15:30 UTC), the same instant as the team lock and registration close", () => {
    expect(SUBMISSION_DEADLINE_AT.toISOString()).toBe("2026-11-05T15:30:00.000Z");
    expect(SUBMISSION_DEADLINE_AT.getTime()).toBe(TEAM_LOCK_AT.getTime());
    expect(SUBMISSION_DEADLINE_AT.getTime()).toBe(REGISTRATION_CLOSES_AT.getTime());
    expect(formatSubmissionDeadlineTime()).toBe("16:30");
    expect(formatSubmissionDeadlineShort()).toBe("16:30, 5 Nov");
  });

  it("is open up to 16:30:00 Rome inclusive and closed after", () => {
    expect(isSubmissionClosed(new Date("2026-11-05T16:00:01+01:00"))).toBe(false);
    expect(isSubmissionClosed(new Date("2026-11-05T16:29:59+01:00"))).toBe(false);
    expect(isSubmissionClosed(new Date("2026-11-05T16:30:00+01:00"))).toBe(false);
    expect(isSubmissionClosed(new Date("2026-11-05T16:30:01+01:00"))).toBe(true);
  });

  it("team submission box fallbacks use the shared formatter, not a hardcoded 16:00", () => {
    const src = readFileSync(join(process.cwd(), "components/dashboard/TeamSubmissionBox.tsx"), "utf8");
    expect(src).not.toContain('"16:00"');
    expect(src).not.toContain('"16:00, 5 Nov"');
    expect(src).toContain("formatSubmissionDeadlineTime()");
    expect(src).toContain("formatSubmissionDeadlineShort()");
  });

  it("derives Draft / Submitted / Closed", () => {
    const before = new Date("2026-11-05T10:00:00+01:00");
    const after = new Date("2026-11-05T17:00:00+01:00");
    expect(getSubmissionStatus(false, before)).toBe("draft");
    expect(getSubmissionStatus(true, before)).toBe("submitted");
    expect(getSubmissionStatus(true, after)).toBe("closed");
    expect(getSubmissionStatus(false, after)).toBe("closed");
  });

  it("formats the countdown", () => {
    expect(formatCountdown((3 * 3600 + 12 * 60 + 5) * 1000)).toBe("3h 12m 05s");
    expect(formatCountdown((26 * 3600 + 60) * 1000)).toBe("1d 2h 01m");
    expect(formatCountdown(-5000)).toBe("0h 00m 00s");
  });
});

describe("GitHub repository URL", () => {
  it("accepts repo URLs and canonicalises them", () => {
    const cases: Record<string, string> = {
      "https://github.com/acme/robot-dog": "https://github.com/acme/robot-dog",
      "http://github.com/acme/robot-dog/": "https://github.com/acme/robot-dog",
      "github.com/acme/robot-dog": "https://github.com/acme/robot-dog",
      "https://www.github.com/acme/robot-dog.git": "https://github.com/acme/robot-dog",
      "  https://github.com/acme/robot.dog_v2  ": "https://github.com/acme/robot.dog_v2",
      "https://github.com/acme/robot-dog/tree/main/src": "https://github.com/acme/robot-dog",
      "https://github.com/acme/robot-dog?tab=readme#top": "https://github.com/acme/robot-dog",
      "https://github.com/a-b-c/x": "https://github.com/a-b-c/x",
    };
    for (const [input, url] of Object.entries(cases)) {
      expect(parseGithubRepoUrl(input)?.url, input).toBe(url);
    }
    expect(parseGithubRepoUrl("https://github.com/acme/robot-dog")).toEqual({
      owner: "acme",
      repo: "robot-dog",
      url: "https://github.com/acme/robot-dog",
    });
  });

  it("rejects anything that is not a github.com repository", () => {
    for (const input of [
      "",
      "   ",
      "acme/robot-dog",
      "https://github.com/acme",
      "https://github.com/",
      "https://gitlab.com/acme/robot-dog",
      "https://github.com.evil.io/acme/robot-dog",
      "https://gist.github.com/acme/abc123",
      "https://github.com/orgs/acme",
      "https://github.com/settings/profile",
      "https://github.com/-acme/robot",
      "https://github.com/acme-/robot",
      "https://github.com/ac--me/robot",
      "https://github.com/acme/..",
      "ftp://github.com/acme/robot-dog",
      "javascript:alert(1)//github.com/acme/robot",
      "https://user:pw@github.com/acme/robot-dog",
      "https://github.com:8443/acme/robot-dog",
      "https://github.com/acme/robot dog",
    ]) {
      expect(parseGithubRepoUrl(input), input).toBeNull();
    }
  });
});

describe("video link", () => {
  it("is optional", () => {
    expect(parseVideoUrl("")).toBe("");
    expect(parseVideoUrl("   ")).toBe("");
    expect(parseVideoUrl(undefined)).toBe("");
  });
  it("accepts http(s) links", () => {
    expect(parseVideoUrl("https://youtu.be/abc")).toBe("https://youtu.be/abc");
    expect(parseVideoUrl(" https://drive.google.com/file/d/x/view ")).toBe("https://drive.google.com/file/d/x/view");
  });
  it("rejects non-links", () => {
    for (const input of ["youtube", "javascript:alert(1)", "ftp://x.y/z", "https://localhost/x", "https://a b.com"]) {
      expect(parseVideoUrl(input), input).toBeNull();
    }
  });
});

describe("member emails", () => {
  it("flags malformed and duplicate addresses", () => {
    expect(findMemberEmailProblems(["a@x.com", "b@y.io"])).toEqual({ malformed: [], duplicates: [] });
    expect(findMemberEmailProblems(["a@x.com", "A@x.com ", "nope"])).toEqual({ malformed: ["nope"], duplicates: ["a@x.com"] });
  });
});
