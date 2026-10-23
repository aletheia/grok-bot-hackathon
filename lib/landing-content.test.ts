import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT, type SponsorTier } from "@/lib/event";
import { buildEventJsonLd } from "@/lib/event-jsonld";
import { getJsonLdSponsors, getJurySlots, getPodium, getSpecialPrizes, getSponsorContactHref, getSponsorTiers } from "@/lib/landing-content";

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
  const tiers: SponsorTier[] = [
    { id: "org", title: "Organized by", kind: "organizer", size: "lg", placeholderSlots: 0, sponsors: [{ name: "Org" }] },
    { id: "main", title: "Main", kind: "sponsor", size: "lg", placeholderSlots: 2, sponsors: [] },
    { id: "p", title: "Partners", kind: "partner", size: "md", placeholderSlots: 0, sponsors: [{ name: "P1", url: "https://p1.test" }, { name: null }] },
    { id: "hidden", title: "Hidden", kind: "partner", size: "sm", placeholderSlots: 0, sponsors: [] },
  ];

  it("fills empty tiers with placeholders and drops tiers with no slots", () => {
    const rendered = getSponsorTiers(tiers);
    expect(rendered.map((t) => t.id)).toEqual(["org", "main", "p"]);
    expect(rendered[1].items).toEqual([null, null]);
    expect(rendered[2].items).toEqual([{ name: "P1", url: "https://p1.test" }, null]);
  });

  it("publishes only named sponsors/partners in JSON-LD, never the organizer or placeholders", () => {
    expect(getJsonLdSponsors(tiers)).toEqual([{ "@type": "Organization", name: "P1", url: "https://p1.test" }]);
  });

  it("uses only a configured contact for the CTA", () => {
    expect(getSponsorContactHref({ email: null, url: null })).toBeNull();
    expect(getSponsorContactHref({ email: " a@b.test ", url: "https://x.test" })).toBe("mailto:a@b.test");
    expect(getSponsorContactHref({ email: "", url: "https://x.test" })).toBe("https://x.test");
  });

  it("current config: six named logos in one tier, no invented urls/tiers/contact", () => {
    expect(EVENT.prizes).toEqual([]);
    expect(EVENT.jury).toEqual([]);
    expect(EVENT.sponsors.contact).toEqual({ email: null, url: null });
    const tier = EVENT.sponsors.tiers.find((t) => t.id === "sponsors");
    expect(tier?.sponsors.map((s) => s.name)).toEqual(["Ctrl+Alt Museum", "Radixia", "Pavia – Open your mind", "SICAM", "Riso Scotti", "Coherency"]);
    expect(tier?.placeholderSlots).toBe(0);
    for (const s of tier!.sponsors) {
      expect(s.url ?? null).toBeNull();
      expect(s.logo).toMatch(/^\/assets\/sponsors\/[a-z-]+\.png$/);
      expect(existsSync(join(process.cwd(), "public", s.logo!))).toBe(true);
      expect(s.logoWidth).toBeGreaterThan(0);
      expect(s.logoHeight).toBeGreaterThan(0);
    }
  });

  it("JSON-LD lists the named sponsors with no empty urls", () => {
    const ld = buildEventJsonLd("https://example.test") as { sponsor?: { "@type": string; name: string; url?: string }[] };
    expect(ld.sponsor?.map((s) => s.name)).toEqual(["Ctrl+Alt Museum", "Radixia", "Pavia – Open your mind", "SICAM", "Riso Scotti", "Coherency"]);
    expect(ld.sponsor?.every((s) => s["@type"] === "Organization" && !("url" in s))).toBe(true);
    expect(JSON.stringify(ld)).not.toContain('"url":""');
  });
});
