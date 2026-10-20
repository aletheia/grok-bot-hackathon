import { describe, expect, it } from "vitest";
import { EVENT, formatAddress, formatDateRange, formatDayLabel, getMapsUrl } from "@/lib/event";
import { buildEventJsonLd } from "@/lib/event-jsonld";
import { LANGUAGES, DEFAULT_LANGUAGE, pickLocale, t, translations } from "@/lib/i18n";

describe("event config", () => {
  it("uses Europe/Rome winter offsets (+01:00) for November", () => {
    expect(EVENT.timezone).toBe("Europe/Rome");
    expect(EVENT.startDate).toMatch(/^2026-11-04T09:00:00\+01:00$/);
    expect(EVENT.endDate).toMatch(/^2026-11-05T22:30:00\+01:00$/);
    expect(new Date(EVENT.startDate).getTime()).toBeLessThan(new Date(EVENT.endDate).getTime());
  });

  it("schedule days fall within the event dates", () => {
    expect(EVENT.schedule.map((d) => d.date)).toEqual(["2026-11-04", "2026-11-05"]);
  });

  it("formats dates and address", () => {
    expect(formatDateRange("it")).toBe("4–5 novembre 2026");
    expect(formatDateRange("en")).toBe("4–5 November 2026");
    expect(formatDayLabel("2026-11-04", "it")).toBe("mercoledì 4 novembre");
    expect(formatAddress("en")).toBe("Via Riviera, 39, 27100 Pavia PV, Italy");
    expect(getMapsUrl()).toContain("Via%20Riviera");
  });
});

describe("event JSON-LD", () => {
  const ld = buildEventJsonLd("https://example.test");

  it("is a schema.org Event with venue and Luma offer", () => {
    expect(ld["@type"]).toBe("Event");
    expect(ld.startDate).toBe(EVENT.startDate);
    expect(ld.location["@type"]).toBe("Place");
    expect(ld.location.address["@type"]).toBe("PostalAddress");
    expect(ld.location.address.addressLocality).toBe("Pavia");
    expect(ld.offers.url).toBe(EVENT.registration.url);
    expect(ld.offers.url).toMatch(/^https:\/\/luma\.com\//);
  });
});

describe("i18n", () => {
  it("defaults to Italian with English second", () => {
    expect(DEFAULT_LANGUAGE).toBe("it");
    expect([...LANGUAGES]).toEqual(["it", "en"]);
  });

  it("every entry has it and en", () => {
    for (const section of Object.values(translations)) {
      for (const entry of Object.values(section)) {
        expect(entry.it.length).toBeGreaterThan(0);
        expect(entry.en.length).toBeGreaterThan(0);
      }
    }
    expect(t("nav", "schedule", "it")).toBe("Programma");
  });

  it("pickLocale falls back to English", () => {
    const copy = { en: { a: "x" }, de: { a: "y" } } as const;
    expect(pickLocale(copy, "it")).toEqual({ a: "x" });
  });
});
