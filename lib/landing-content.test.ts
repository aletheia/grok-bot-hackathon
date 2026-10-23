import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { buildEventJsonLd } from "@/lib/event-jsonld";
import { getJsonLdSponsors, getJurySlots, getPodium, getSpecialPrizes, getSponsorContactHref, getSponsorItems } from "@/lib/landing-content";

describe("prizes", () => {
  it("always renders three podium slots, placeholders when nothing is announced", () => {
    expect(getPodium([])).toEqual([
      { place: 1, prize: null },
      { place: 2, prize: null },
      { place: 3, prize: null },
    ]);
  });

  it("puts placed prizes on the podium and the rest in the special list", () => {
    const prizes = [
      { place: 2 as const, title: "Runner-up", reward: "R2" },
      { title: "Track prize", reward: null, track: "T" },
      { place: 1 as const, title: null, reward: null },
    ];
    const podium = getPodium(prizes);
    expect(podium[0].prize).toBeNull();
    expect(podium[1].prize?.title).toBe("Runner-up");
    expect(getSpecialPrizes(prizes).map((p) => p.title)).toEqual(["Track prize"]);
  });
});

describe("jury", () => {
  it("shows placeholder slots while no juror is named", () => {
    expect(getJurySlots([], 3)).toEqual([null, null, null]);
    expect(getJurySlots([{ name: "A" }, { name: null }], 3)).toEqual([{ name: "A" }, null]);
  });
});

describe("sponsors", () => {
  const list = [{ name: "P1", url: "https://p1.test" }, { name: null }, { name: "P2", url: "" }];

  it("renders named sponsors in order, or placeholders while none are named", () => {
    expect(getSponsorItems(list, 4).map((s) => s?.name)).toEqual(["P1", "P2"]);
    expect(getSponsorItems([], 3)).toEqual([null, null, null]);
    expect(getSponsorItems([{ name: null }], 0)).toEqual([]);
  });

  it("publishes named sponsors in JSON-LD without empty urls", () => {
    expect(getJsonLdSponsors(list)).toEqual([
      { "@type": "Organization", name: "P1", url: "https://p1.test" },
      { "@type": "Organization", name: "P2" },
    ]);
  });

  it("uses only a configured contact for the CTA", () => {
    expect(getSponsorContactHref({ email: null, url: null })).toBeNull();
    expect(getSponsorContactHref({ email: " a@b.test ", url: "https://x.test" })).toBe("mailto:a@b.test");
    expect(getSponsorContactHref({ email: "", url: "https://x.test" })).toBe("https://x.test");
  });

  const names = ["Radixia", "Pavia – Open your mind", "SICAM", "Riso Scotti", "Coherency"];

  it("current config: five named logos in one flat list, no invented urls/tiers/contact", () => {
    expect(EVENT.prizes).toEqual([]);
    expect(EVENT.jury).toEqual([]);
    expect(EVENT.sponsors.contact).toEqual({ email: null, url: null });
    expect(EVENT.sponsors).not.toHaveProperty("tiers");
    expect(EVENT.sponsors.list.map((s) => s.name)).toEqual(names);
    for (const s of EVENT.sponsors.list) {
      expect(s.url ?? null).toBeNull();
      expect(s.logo).toMatch(/^\/assets\/sponsors\/[a-z-]+\.png$/);
      expect(existsSync(join(process.cwd(), "public", s.logo!))).toBe(true);
      expect(s.logoWidth).toBeGreaterThan(0);
      expect(s.logoHeight).toBeGreaterThan(0);
    }
  });

  it("first row: SpaceXAI and Ctrl+Alt Museum as equal logo tiles, not repeated in the grid", () => {
    const organizers = EVENT.sponsors.organizers;
    expect(organizers.map((o) => o.name)).toEqual(["SpaceXAI", "Ctrl+Alt Museum"]);
    expect(organizers[0].logoAlt).toBe("SpaceXAI");
    for (const o of organizers) {
      expect(o.logo).toMatch(/^\/assets\/sponsors\/[a-z-]+\.png$/);
      expect(existsSync(join(process.cwd(), "public", o.logo!))).toBe(true);
    }
    const gridNames = EVENT.sponsors.list.map((s) => s.name);
    for (const o of organizers) expect(gridNames).not.toContain(o.name);
  });

  it("JSON-LD lists the five sponsors, not the organizers, with no urls", () => {
    const ld = buildEventJsonLd("https://example.test") as { sponsor?: { "@type": string; name: string; url?: string }[] };
    expect(ld.sponsor?.map((s) => s.name)).toEqual(names);
    expect(ld.sponsor?.every((s) => s["@type"] === "Organization" && !("url" in s))).toBe(true);
    expect(JSON.stringify(ld)).not.toContain('"url":""');
  });
});
