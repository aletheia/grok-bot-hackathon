import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/api/http";
import { TEAM_INVITE_ALPHABET, TEAM_LIMITS } from "@/lib/teams/constants";
import {
  TEAM_LOCK_AT,
  assertCanJoin,
  assertCodeJoinable,
  assertValidTeamCodeFormat,
  isCodeCollisionError,
  isValidTeamCodeFormat,
  normalizeTeamCode,
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

describe("team code normalisation and lookup", () => {
  it("canonicalises case, spaces, hyphens and underscores", () => {
    expect(normalizeTeamCode(" ab3k-9xzq ")).toBe("AB3K9XZQ");
    expect(normalizeTeamCode("ab3k 9xzq")).toBe("AB3K9XZQ");
    expect(normalizeTeamCode("ab3k_9xzq\n")).toBe("AB3K9XZQ");
    expect(normalizeTeamCode("AB3K9XZQ")).toBe("AB3K9XZQ");
  });

  it("every generated code is already canonical and valid, so equality lookup is case-insensitive", () => {
    for (let i = 0; i < 300; i += 1) {
      const code = generateTeamCode();
      expect(normalizeTeamCode(code)).toBe(code);
      expect(normalizeTeamCode(code.toLowerCase())).toBe(code);
      expect(isValidTeamCodeFormat(code)).toBe(true);
    }
  });

  it("has enough entropy: 32^8 = 2^40 codes", () => {
    expect(Math.log2(TEAM_INVITE_ALPHABET.length ** TEAM_LIMITS.inviteCodeLength)).toBe(40);
  });

  it("rejects malformed codes with a clear 400", () => {
    for (const bad of ["", "ABC", "AB3K9XZ0", "AB3K9XZI", "AB3K9XZO", "AB3K9XZ1", "AB3K9XZQQ", "AB3K9X!Q"]) {
      expect(isValidTeamCodeFormat(bad)).toBe(false);
    }
    try {
      assertValidTeamCodeFormat("NOPE");
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).status).toBe(400);
      expect((error as AppError).code).toBe("INVALID_CODE_FORMAT");
      expect((error as AppError).message).toMatch(/does not look like a team code/);
    }
  });

  it("recognises unique violations on the code indexes only (also when wrapped)", () => {
    expect(isCodeCollisionError({ code: "23505", constraint: "team_join_code_unique" })).toBe(true);
    expect(isCodeCollisionError({ code: "23505", constraint: "team_invite_code_unique" })).toBe(true);
    expect(isCodeCollisionError(new Error("x", { cause: { code: "23505", constraint: "team_invite_code_unique" } }))).toBe(true);
    expect(isCodeCollisionError({ code: "23505", constraint: "team_name_unique" })).toBe(false);
    expect(isCodeCollisionError(new Error("boom"))).toBe(false);
    expect(isCodeCollisionError(null)).toBe(false);
  });
});

describe("join with a code", () => {
  const BEFORE_LOCK = new Date("2026-10-28T12:00:00+01:00");
  const AFTER_LOCK = new Date("2026-11-01T00:00:00+01:00");
  const code = "AB3K9XZQ";
  const invite = { code, revokedAt: null, expiresAt: null, maxUses: null, usedCount: 0 };
  const team = { status: "active", joinCode: code, memberCount: 3, maxMembers: 6 };
  const join = (over: Partial<Parameters<typeof assertCodeJoinable>[0]> = {}) =>
    assertCodeJoinable({ code, invite, team, now: BEFORE_LOCK, ...over });
  const failure = (fn: () => void) => {
    try {
      fn();
    } catch (error) {
      return error as AppError;
    }
    throw new Error("expected an error");
  };

  it("accepts a valid code for a team with room", () => {
    expect(() => join()).not.toThrow();
    expect(() => join({ team: { ...team, memberCount: 5 } })).not.toThrow();
  });

  it("refuses an unknown code (404)", () => {
    const e = failure(() => join({ invite: null, team: null }));
    expect([e.status, e.code]).toEqual([404, "INVALID_INVITE_CODE"]);
    expect(e.message).toMatch(/could not find a team with that code/);
  });

  it("refuses a code the lead replaced (revoked, or no longer the team's current code)", () => {
    const revoked = failure(() => join({ invite: { ...invite, revokedAt: new Date() } }));
    expect([revoked.status, revoked.code]).toEqual([409, "INVALID_INVITE_CODE"]);
    expect(revoked.message).toMatch(/no longer active/);
    const stale = failure(() => join({ team: { ...team, joinCode: "ZZZZ2222" } }));
    expect(stale.code).toBe("INVALID_INVITE_CODE");
  });

  it("refuses expired and exhausted codes", () => {
    expect(failure(() => join({ invite: { ...invite, expiresAt: new Date("2026-10-27T00:00:00Z") } })).code).toBe("INVITE_EXPIRED");
    expect(failure(() => join({ invite: { ...invite, maxUses: 2, usedCount: 2 } })).code).toBe("INVITE_EXHAUSTED");
  });

  it("refuses a full team (409 TEAM_FULL) until someone leaves", () => {
    const full = failure(() => join({ team: { ...team, memberCount: 6 } }));
    expect([full.status, full.code]).toEqual([409, "TEAM_FULL"]);
    expect(() => join({ team: { ...team, memberCount: 5 } })).not.toThrow();
  });

  it("refuses an archived team", () => {
    expect(failure(() => join({ team: { ...team, status: "archived" } })).code).toBe("TEAM_ARCHIVED");
  });

  it("refuses everything after the lock, even a perfectly valid code", () => {
    const locked = failure(() => join({ now: AFTER_LOCK }));
    expect([locked.status, locked.code]).toEqual([409, "TEAMS_LOCKED"]);
  });

  it("is still open at 23:59 on the lock day", () => {
    expect(() => join({ now: new Date("2026-10-31T23:58:59+01:00") })).not.toThrow();
  });
});

describe("join request parsing", () => {
  it("normalises what people paste and rejects non-codes before touching the database", async () => {
    const { parseJoinTeamInput } = await import("@/lib/teams/validation");
    expect(parseJoinTeamInput({ code: " ab3k-9xzq " })).toEqual({ code: "AB3K9XZQ" });
    expect(() => parseJoinTeamInput({ code: "hello" })).toThrow(/does not look like a team code/);
    expect(() => parseJoinTeamInput({})).toThrow();
  });
});

describe("team paths copy", () => {
  it("lists the three paths in order and promises nothing about naming participants", async () => {
    const { getTeamPaths, getTeamRules } = await import("@/lib/teams/rules");
    expect(getTeamPaths().map((p) => p.title)).toEqual(["Register a team", "Join a team", "I'm looking for a team"]);
    const text = [...getTeamPaths(), ...getTeamRules()].map((r) => `${r.title} ${r.body}`).join(" ");
    expect(text).not.toMatch(/naming the other participants/i);
    expect(text).toContain("Registering a team gives priority for participation confirmation.");
  });
});
