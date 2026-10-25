import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { formatDeadlineDay, formatDeadlineTime, getDeadlineLine } from "@/lib/registration-deadline";

describe("event card deadline line", () => {
  it("is derived from EVENT.registration.registrationCloses (31 Oct 23:59 Rome)", () => {
    expect(EVENT.registration.registrationCloses.startsWith("2026-10-31T23:59")).toBe(true);
    expect(formatDeadlineDay()).toBe("31 October");
    expect(formatDeadlineTime()).toBe("23:59");
  });

  it("reads 'Teams: register by 31 October, 23:59 (Rome time).' before and during the window", () => {
    for (const iso of ["2026-10-25T10:00:00+01:00", "2026-10-28T12:00:00+01:00", "2026-10-31T23:59:00+01:00"]) {
      const line = getDeadlineLine(new Date(iso));
      expect(`${line.label} ${line.text}`).toBe("Teams: register by 31 October, 23:59 (Rome time).");
    }
  });

  it("never mentions the opening date", () => {
    const line = getDeadlineLine(new Date("2026-10-25T10:00:00+01:00"));
    expect(`${line.label} ${line.text}`).not.toMatch(/opens|26 Oct/i);
  });

  it("says closed after the deadline", () => {
    const line = getDeadlineLine(new Date("2026-11-01T00:00:00+01:00"));
    expect(`${line.label} ${line.text}`).toBe("Teams: registration closed on 31 October.");
  });

  it("follows a different closing instant (not hard-coded)", () => {
    const closes = new Date("2026-11-02T21:30:00+01:00");
    const line = getDeadlineLine(new Date("2026-11-01T10:00:00+01:00"), closes);
    expect(line.text).toBe("register by 2 November, 21:30 (Rome time).");
  });
});
