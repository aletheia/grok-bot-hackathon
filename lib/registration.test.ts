import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import {
  getRegistrationNotice,
  getRegistrationState,
  REGISTRATION_CLOSES_AT,
  REGISTRATION_OPENS_AT,
} from "@/lib/registration";
import { TEAM_LOCK_AT } from "@/lib/teams/rules";
import { formatRome } from "@/lib/time/rome";

const at = (iso: string) => new Date(iso);

describe("registration window", () => {
  it("is configured in Rome time: opens 26 Oct 00:00, closes 2 Nov 23:59", () => {
    expect(EVENT.registration.registrationOpens.startsWith("2026-10-26T00:00")).toBe(true);
    expect(EVENT.registration.registrationCloses.startsWith("2026-11-02T23:59")).toBe(true);
    expect(formatRome(REGISTRATION_OPENS_AT, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })).toContain("26");
    expect(REGISTRATION_OPENS_AT.getTime()).toBeLessThan(REGISTRATION_CLOSES_AT.getTime());
  });

  it("closes at the same moment as the team lock (single deadline)", () => {
    expect(REGISTRATION_CLOSES_AT.getTime()).toBe(TEAM_LOCK_AT.getTime());
  });

  it("derives before / open / closed", () => {
    expect(getRegistrationState(at("2026-10-25T23:59:59+01:00"))).toBe("before");
    expect(getRegistrationState(at("2026-10-26T00:00:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-28T12:00:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-30T23:59:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-31T00:00:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-31T23:59:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-11-01T12:00:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-11-02T23:59:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-11-02T23:59:01+01:00"))).toBe("closed");
    expect(getRegistrationState(at("2026-11-03T00:00:00+01:00"))).toBe("closed");
  });

  it("accepts epoch milliseconds", () => {
    expect(getRegistrationState(at("2026-10-28T12:00:00+01:00").getTime())).toBe("open");
  });

  it("writes a deadline-only headline for each state and never advertises the opening date", () => {
    expect(getRegistrationNotice(at("2026-10-20T12:00:00+02:00")).headline).toBe(
      "Registration closes on November 2 (23:59, Rome time).",
    );
    expect(getRegistrationNotice(at("2026-10-27T12:00:00+01:00")).headline).toBe(
      "Registration closes on November 2 (23:59, Rome time).",
    );
    expect(getRegistrationNotice(at("2026-10-25T12:00:00+01:00")).state).toBe("before");
    const closed = getRegistrationNotice(at("2026-11-03T12:00:00+01:00"));
    expect(closed.headline).toBe("Registration closed on November 2.");
    expect(closed.body).toBe("");
  });

  it("never mentions the opening date or 'opens' in any state", () => {
    for (const iso of ["2026-10-20T12:00:00+02:00", "2026-10-27T12:00:00+01:00", "2026-11-03T12:00:00+01:00"]) {
      const { headline, body } = getRegistrationNotice(at(iso));
      expect(`${headline} ${body}`).not.toMatch(/opens|October 26|26 Oct/i);
    }
  });

  it("never mentions October 30 as a deadline", () => {
    for (const iso of ["2026-10-20T12:00:00+02:00", "2026-10-27T12:00:00+01:00", "2026-11-03T12:00:00+01:00"]) {
      const { headline, body } = getRegistrationNotice(at(iso));
      expect(`${headline} ${body}`).not.toMatch(/October 30|30 October/);
    }
  });

  it("explains the code-based flow, individuals and the team priority before and during", () => {
    for (const iso of ["2026-10-20T12:00:00+02:00", "2026-10-27T12:00:00+01:00"]) {
      const { body } = getRegistrationNotice(at(iso));
      expect(body).toContain("Register a team and share its secret code");
      expect(body).toContain("join a team with a code");
      expect(body).toContain("Register as looking for a team");
      expect(body).toContain("Registering a team gives priority for participation confirmation.");
      expect(body).not.toContain("naming the other participants");
    }
  });
});
