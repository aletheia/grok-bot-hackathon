import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { formatDeadlineDay, formatDeadlineTime, getDeadlineLine } from "@/lib/registration-deadline";

describe("event card deadline line", () => {
  it("is derived from EVENT.registration.registrationCloses (5 Nov 17:00 Rome)", () => {
    expect(EVENT.registration.registrationCloses.startsWith("2026-11-05T17:00")).toBe(true);
    expect(formatDeadlineDay()).toBe("5 November");
    expect(formatDeadlineTime()).toBe("17:00");
  });

  it("reads 'Final Deadline for submission: 5 November, 17:00 (Rome time).' before and during the window", () => {
    for (const iso of ["2026-10-25T10:00:00+01:00", "2026-11-03T12:00:00+01:00", "2026-11-04T23:30:00+01:00", "2026-11-05T16:00:00+01:00", "2026-11-05T16:30:00+01:00", "2026-11-05T17:00:00+01:00"]) {
      const line = getDeadlineLine(new Date(iso));
      expect(`${line.label} ${line.text}`).toBe("Final Deadline for submission: 5 November, 17:00 (Rome time).");
    }
  });

  it("never mentions the opening date", () => {
    const line = getDeadlineLine(new Date("2026-10-25T10:00:00+01:00"));
    expect(`${line.label} ${line.text}`).not.toMatch(/opens|26 Oct/i);
  });

  it("says the deadline has passed after it, never 'registration closes'", () => {
    const line = getDeadlineLine(new Date("2026-11-05T17:00:01+01:00"));
    expect(`${line.label} ${line.text}`).toBe("Final Deadline for submission: passed on 5 November, 17:00 (Rome time).");
    expect(`${line.label} ${line.text}`).not.toMatch(/registration clos/i);
  });

  it("follows a different closing instant (not hard-coded)", () => {
    const closes = new Date("2026-11-02T21:30:00+01:00");
    const line = getDeadlineLine(new Date("2026-11-01T10:00:00+01:00"), closes);
    expect(line.text).toBe("2 November, 21:30 (Rome time).");
  });
});
