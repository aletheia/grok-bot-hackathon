import { describe, expect, it } from "vitest";
import { formatRome, romeLocalToUtc, utcToRomeLocal, zoneOffsetMinutes } from "@/lib/time/rome";

describe("Europe/Rome time handling", () => {
  it("uses +01:00 in winter and +02:00 in summer", () => {
    expect(zoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"))).toBe(60);
    expect(zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });

  it("converts Rome wall-clock to UTC across DST", () => {
    expect(romeLocalToUtc("2026-10-31T23:59").toISOString()).toBe("2026-10-31T22:59:00.000Z");
    expect(romeLocalToUtc("2026-11-04T09:00").toISOString()).toBe("2026-11-04T08:00:00.000Z");
    expect(romeLocalToUtc("2026-07-01T09:00").toISOString()).toBe("2026-07-01T07:00:00.000Z");
    // Day of the autumn change (25 Oct 2026): before 03:00 it is still +02:00, after it is +01:00.
    expect(romeLocalToUtc("2026-10-25T01:30").toISOString()).toBe("2026-10-24T23:30:00.000Z");
    expect(romeLocalToUtc("2026-10-25T12:00").toISOString()).toBe("2026-10-25T11:00:00.000Z");
  });

  it("round-trips UTC → Rome wall-clock for the datetime-local input", () => {
    expect(utcToRomeLocal(new Date("2026-10-31T22:59:00Z"))).toBe("2026-10-31T23:59");
    expect(utcToRomeLocal(new Date("2026-06-01T10:00:00Z"))).toBe("2026-06-01T12:00");
    const local = "2026-11-05T18:30";
    expect(utcToRomeLocal(romeLocalToUtc(local))).toBe(local);
  });

  it("formats in Rome time regardless of the server zone", () => {
    expect(formatRome(new Date("2026-10-31T22:59:00Z"))).toContain("23:59");
  });
});
