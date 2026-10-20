import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/api/http";
import { TEAM_INVITE_ALPHABET, TEAM_LIMITS } from "@/lib/teams/constants";
import {
  TEAM_LOCK_AT,
  assertCanJoin,
  assertTeamsOpen,
  generateTeamCode,
  isTeamFormed,
  isTeamOpen,
  isTeamsLocked,
  pickNextLead,
  teamSizeStatus,
} from "@/lib/teams/policy";
import { formatTeamLock } from "@/lib/teams/rules";

describe("team code", () => {
  it("is 8 chars from the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i += 1) {
      const code = generateTeamCode();
      expect(code).toHaveLength(TEAM_LIMITS.inviteCodeLength);
      expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it("maps bytes uniformly onto the 32-char alphabet", () => {
    expect(TEAM_INVITE_ALPHABET).toHaveLength(32);
    const code = generateTeamCode(() => Uint8Array.from([0, 1, 31, 32, 63, 64, 255, 128]));
    // 0→2, 1→3, 31→Z, 32→2, 63→Z, 64→2, 255→Z, 128→2
    expect(code).toBe("23Z2Z2Z2");
  });

  it("produces distinct codes", () => {
    const codes = new Set(Array.from({ length: 2000 }, () => generateTeamCode()));
    expect(codes.size).toBe(2000);
  });
});

describe("size limits", () => {
  it("min 4, max 6", () => {
    expect(TEAM_LIMITS.minMembers).toBe(4);
    expect(TEAM_LIMITS.maxMembers).toBe(6);
  });

  it("closes automatically at 6 and reopens below", () => {
    expect(isTeamOpen(5)).toBe(true);
    expect(isTeamOpen(6)).toBe(false);
    expect(() => assertCanJoin(6)).toThrow(AppError);
    expect(() => assertCanJoin(5)).not.toThrow();
    // a member leaves a full team → open again
    expect(isTeamOpen(6 - 1)).toBe(true);
  });

  it("is formed from 4 members", () => {
    expect(isTeamFormed(3)).toBe(false);
    expect(isTeamFormed(4)).toBe(true);
    expect(teamSizeStatus(2)).toBe("forming");
    expect(teamSizeStatus(4)).toBe("formed");
    expect(teamSizeStatus(6)).toBe("full");
  });

  it("full-team error is a 409 TEAM_FULL", () => {
    try {
      assertCanJoin(6, 6);
    } catch (error) {
      expect((error as AppError).status).toBe(409);
      expect((error as AppError).code).toBe("TEAM_FULL");
    }
  });
});

describe("lead hand-over", () => {
  const members = [
    { id: "m3", userId: "carol", joinedAt: new Date("2026-10-22T10:00:00Z") },
    { id: "m1", userId: "alice", joinedAt: new Date("2026-10-21T09:00:00Z") },
    { id: "m2", userId: "bob", joinedAt: new Date("2026-10-21T09:30:00Z") },
    { id: "m0", userId: "dave", joinedAt: new Date("2026-10-22T10:00:00Z") },
  ];

  it("passes the lead to the earliest remaining member", () => {
    expect(pickNextLead(members, "alice")?.userId).toBe("bob");
    expect(pickNextLead(members, "bob")?.userId).toBe("alice");
  });

  it("breaks joinedAt ties by membership id", () => {
    const tied = members.filter((m) => m.userId === "carol" || m.userId === "dave");
    expect(pickNextLead(tied, "nobody")?.userId).toBe("dave");
  });

  it("returns null when the team becomes empty", () => {
    expect(pickNextLead([members[0]], "carol")).toBeNull();
  });
});

describe("team lock", () => {
  it("is 31 October 2026 23:59 Rome time (22:59 UTC, CET)", () => {
    expect(TEAM_LOCK_AT.toISOString()).toBe("2026-10-31T22:59:00.000Z");
    expect(formatTeamLock()).toBe("31 October 2026 at 23:59 (Rome time)");
  });

  it("is open until the lock instant and locked after", () => {
    expect(isTeamsLocked(new Date("2026-10-31T22:58:59Z"))).toBe(false);
    expect(isTeamsLocked(new Date("2026-10-31T22:59:00Z"))).toBe(false);
    expect(isTeamsLocked(new Date("2026-10-31T22:59:01Z"))).toBe(true);
    // 23:30 Rome is still open, although it is already 1 Nov 03:30 in Tashkent (UTC+5).
    expect(isTeamsLocked(new Date("2026-10-31T23:30:00+01:00"))).toBe(false);
    expect(isTeamsLocked(new Date("2026-11-01T03:30:00+05:00"))).toBe(false);
    // 23:30 UTC = 00:30 Rome on 1 Nov: locked.
    expect(isTeamsLocked(new Date("2026-10-31T23:30:00+00:00"))).toBe(true);
    expect(isTeamsLocked(new Date("2026-10-31T22:30:00Z"))).toBe(false);
  });

  it("throws 409 TEAMS_LOCKED after the lock", () => {
    expect(() => assertTeamsOpen(new Date("2026-11-01T00:00:00+01:00"))).toThrowError(/locked/i);
    try {
      assertTeamsOpen(new Date("2026-11-02T00:00:00Z"));
    } catch (error) {
      expect((error as AppError).code).toBe("TEAMS_LOCKED");
      expect((error as AppError).status).toBe(409);
    }
    expect(() => assertTeamsOpen(new Date("2026-10-20T12:00:00Z"))).not.toThrow();
  });
});
