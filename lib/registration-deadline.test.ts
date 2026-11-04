import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { formatDeadlineDay, formatDeadlineTime, getDeadlineLine } from "@/lib/registration-deadline";

describe("event card deadline line", () => {
  it("is derived from EVENT.registration.registrationCloses (5 Nov 16:00 Rome)", () => {
    expect(EVENT.registration.registrationCloses.startsWith("2026-11-05T16:00")).toBe(true);
    expect(formatDeadlineDay()).toBe("5 November");
    expect(formatDeadlineTime()).toBe("16:00");
  });

  it("reads 'Teams: register by 5 November, 16:00 (Rome time).' before and during the window (reopened)", () => {
    for (const iso of ["2026-10-25T10:00:00+01:00", "2026-11-03T12:00:00+01:00", "2026-11-04T23:30:00+01:00", "2026-11-05T16:00:00+01:00"]) {
      const line = getDeadlineLine(new Date(iso));
      expect(`${line.label} ${line.text}`).toBe("Teams: register by 5 November, 16:00 (Rome time).");
    }
  });

  it("never mentions the opening date", () => {
    const line = getDeadlineLine(new Date("2026-10-25T10:00:00+01:00"));
    expect(`${line.label} ${line.text}`).not.toMatch(/opens|26 Oct/i);
  });

  it("says closed after the deadline", () => {
    const line = getDeadlineLine(new Date("2026-11-05T16:00:01+01:00"));
    expect(`${line.label} ${line.text}`).toBe("Teams: registration closed on 5 November.");
  });

  it("follows a different closing instant (not hard-coded)", () => {
    const closes = new Date("2026-11-02T21:30:00+01:00");
    const line = getDeadlineLine(new Date("2026-11-01T10:00:00+01:00"), closes);
    expect(line.text).toBe("register by 2 November, 21:30 (Rome time).");
  });
});
