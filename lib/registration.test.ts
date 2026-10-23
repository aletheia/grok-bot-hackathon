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
  it("is configured in Rome time: opens 26 Oct 00:00, closes 30 Oct 23:59", () => {
    expect(EVENT.registration.registrationOpens.startsWith("2026-10-26T00:00")).toBe(true);
    expect(EVENT.registration.registrationCloses.startsWith("2026-10-30T23:59")).toBe(true);
    expect(formatRome(REGISTRATION_OPENS_AT, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })).toContain("26");
    expect(REGISTRATION_OPENS_AT.getTime()).toBeLessThan(REGISTRATION_CLOSES_AT.getTime());
  });

  it("closes before the team lock", () => {
    expect(REGISTRATION_CLOSES_AT.getTime()).toBeLessThan(TEAM_LOCK_AT.getTime());
  });

  it("derives before / open / closed", () => {
    expect(getRegistrationState(at("2026-10-25T23:59:59+01:00"))).toBe("before");
    expect(getRegistrationState(at("2026-10-26T00:00:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-28T12:00:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-30T23:59:00+01:00"))).toBe("open");
    expect(getRegistrationState(at("2026-10-31T00:00:00+01:00"))).toBe("closed");
  });

  it("accepts epoch milliseconds", () => {
    expect(getRegistrationState(at("2026-10-28T12:00:00+01:00").getTime())).toBe("open");
  });

  it("writes the headline for each state", () => {
    expect(getRegistrationNotice(at("2026-10-20T12:00:00+02:00")).headline).toBe(
      "Team registration opens on October 26 and runs until October 30.",
    );
    expect(getRegistrationNotice(at("2026-10-27T12:00:00+01:00")).headline).toBe(
      "Team registration is open until October 30 (23:59, Rome time).",
    );
    const closed = getRegistrationNotice(at("2026-11-01T12:00:00+01:00"));
    expect(closed.headline).toBe("Team registration closed on October 30.");
    expect(closed.body).toBe("");
  });

  it("explains individual vs team registration and the team priority before and during", () => {
    for (const iso of ["2026-10-20T12:00:00+02:00", "2026-10-27T12:00:00+01:00"]) {
      const { body } = getRegistrationNotice(at(iso));
      expect(body).toContain("as an individual looking for a team");
      expect(body).toContain("naming the other participants");
      expect(body).toContain("Registering as a team gives priority for participation confirmation.");
    }
  });
});
