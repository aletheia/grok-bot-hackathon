import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT, formatAddress, formatDateRange, formatDayLabel, getMapsUrl, type ScheduleDay } from "@/lib/event";
import { buildEventJsonLd } from "@/lib/event-jsonld";
import { t, translations } from "@/lib/i18n";

describe("event config", () => {
  it("uses Europe/Rome winter offsets (+01:00) for November", () => {
    expect(EVENT.timezone).toBe("Europe/Rome");
    expect(EVENT.startDate).toBe("2026-11-04T09:00:00+01:00");
    expect(EVENT.endDate).toBe("2026-11-05T22:30:00+01:00");
    expect(new Date(EVENT.startDate).getTime()).toBeLessThan(new Date(EVENT.endDate).getTime());
  });

  it("marks the Ctrl+Alt Ecosystem presentation as invitation only (and nothing else)", () => {
    const days: readonly ScheduleDay[] = EVENT.schedule;
    const items = days.flatMap((d) => d.items);
    const flagged = items.filter((i) => i.invitationOnly);
    expect(flagged.map((i) => i.title)).toEqual(["Ctrl+Alt Ecosystem presentation"]);
    expect(t("landing", "invitationOnly")).toBe("Invitation only");
  });

  it("hardware: four illustrated cards (simulators not adjacent) and drones as text only", () => {
    expect(EVENT.hardware.map((h) => h.id)).toEqual(["robot-dog", "flight-sim", "robotic-arm", "driving-sim", "drones"]);
    const names = Object.fromEntries(EVENT.hardware.map((h) => [h.id, h.name]));
    expect(names["robotic-arm"]).toBe("A robotic arm");
    expect(names.drones).toBe("A few drones");
    const ids = EVENT.hardware.map((h) => h.id);
    expect(Math.abs(ids.indexOf("flight-sim") - ids.indexOf("driving-sim"))).toBeGreaterThan(1);
    for (const h of EVENT.hardware.filter((i) => i.id !== "drones")) {
      const img = h.image!;
      expect(img.src).toMatch(/^\/assets\/hardware\/[a-z-]+\.png$/);
      expect(existsSync(join(process.cwd(), "public", img.src))).toBe(true);
      expect(statSync(join(process.cwd(), "public", img.src)).size).toBeLessThan(150 * 1024);
      expect(img.width).toBeGreaterThan(0);
      expect(img.height).toBeGreaterThan(0);
      expect(img.alt).toMatch(/^Line drawing of /);
    }
    expect(EVENT.hardware.find((h) => h.id === "drones")!.image).toBeUndefined();
    const alts = EVENT.hardware.flatMap((h) => (h.image ? [h.image.alt] : []));
    expect(new Set(alts).size).toBe(alts.length);
  });

  it("\"You can use\" lists the verified Grok stack and Cursor, each with a line and an official https link", () => {
    expect(EVENT.grokStack.map((i) => i.name)).toEqual([
      "Grok API",
      "Search and code tools",
      "Grok Voice",
      "Grok Imagine",
      "Grok Build",
      "Grok Bot",
      "Cursor",
    ]);
    expect(new Set(EVENT.grokStack.map((i) => i.name)).size).toBe(EVENT.grokStack.length);
    for (const item of EVENT.grokStack) {
      expect(item.description.length).toBeGreaterThan(10);
      expect(item.description).not.toMatch(/credit|free|\$/i);
      expect(new URL(item.url!).protocol).toBe("https:");
      expect(["docs.x.ai", "x.ai", "cursor.com"]).toContain(new URL(item.url!).hostname);
    }
    expect(t("landing", "briefWith")).toBe("You can use");
  });

  it("schedule days fall within the event dates", () => {
    expect(EVENT.schedule.map((d) => d.date)).toEqual(["2026-11-04", "2026-11-05"]);
  });

  it("formats dates and address in English", () => {
    expect(formatDateRange()).toBe("4–5 November 2026");
    expect(formatDayLabel("2026-11-04")).toBe("Wednesday 4 November");
    expect(formatAddress()).toBe("Via Gragnani, 18, 27100 Pavia PV, Italy");
    expect(getMapsUrl()).toContain("Via%20Gragnani");
  });

  it("keeps placeholders explicit (null) instead of invented assets", () => {
    expect(Object.values(EVENT.assets.logos).every((v) => v === null || typeof v === "string")).toBe(true);
    expect(EVENT.hosts.every((h) => h.photo === null || typeof h.photo === "string")).toBe(true);
  });

  it("portal settings: 4–6 per team, lock on 31 Oct 23:59 Rome", () => {
    expect(EVENT.portal.team).toEqual({ minMembers: 4, maxMembers: 6 });
    expect(new Date(EVENT.portal.teamLockAt).toISOString()).toBe("2026-10-31T22:59:00.000Z");
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
    expect(ld.inLanguage).toBe("en");
  });
});

describe("copy (English only)", () => {
  it("every entry is a non-empty string", () => {
    for (const section of Object.values(translations)) {
      for (const entry of Object.values(section)) {
        expect(typeof entry).toBe("string");
        expect((entry as string).length).toBeGreaterThan(0);
      }
    }
    expect(t("nav", "schedule")).toBe("Schedule");
  });
});
