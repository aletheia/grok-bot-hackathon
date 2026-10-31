import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { buildEventJsonLd } from "@/lib/event-jsonld";
import { getJsonLdSponsors, getJurySlots, getSponsorContactHref, getSponsorItems } from "@/lib/landing-content";

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

  const names = ["Radixia", "Pavia – Open your mind", "SICAM", "Riso Scotti", "Coherency", "SeaVision", "Spazio Robot"];

  it("current config: seven named logos in one flat list, no invented urls/tiers/contact", () => {
    expect(EVENT.prizes).toEqual([]);
    expect(EVENT.jury.length).toBeGreaterThan(0);
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

  it("SeaVision and Spazio Robot have alt text and optimised assets; Spazio Robot is last in the grid", () => {
    const sv = EVENT.sponsors.list.find((s) => s.name === "SeaVision")!;
    expect(sv.logoAlt).toBe("SeaVision");
    expect(statSync(join(process.cwd(), "public", sv.logo!)).size).toBeLessThan(100 * 1024);
    const sr = EVENT.sponsors.list.at(-1)!;
    expect(sr.name).toBe("Spazio Robot");
    expect(sr.logoAlt).toBe("Spazio Robot");
    expect(sr.logo).toBe("/assets/sponsors/spazio-robot.png");
    expect(statSync(join(process.cwd(), "public", sr.logo!)).size).toBeLessThan(100 * 1024);
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

  it("JSON-LD lists the seven sponsors, not the organizers, with no urls", () => {
    const ld = buildEventJsonLd("https://example.test") as { sponsor?: { "@type": string; name: string; url?: string }[] };
    expect(ld.sponsor?.map((s) => s.name)).toEqual(names);
    expect(ld.sponsor?.every((s) => s["@type"] === "Organization" && !("url" in s))).toBe(true);
    expect(JSON.stringify(ld)).not.toContain('"url":""');
  });
});

describe("prizes list is not shown", () => {
  it("no prizes section on the landing and no #prizes link anywhere in the app", async () => {
    const { readFileSync } = await import("node:fs");
    const files = ["app/page.tsx", "components/Navigation.tsx", "components/landing/index.ts", "app/tracks/page.tsx", "app/rules/page.tsx"];
    for (const f of files) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      expect(src, f).not.toMatch(/<Prizes\b|#prizes|'prizes'/);
    }
    expect(existsSync(join(process.cwd(), "components/landing/Prizes.tsx"))).toBe(false);
  });
});

describe("jury grid", () => {
  it("2 columns on mobile, 3 on md, 4 on lg; rows not forced to equal height", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(join(process.cwd(), "components/landing/Jury.tsx"), "utf8");
    expect(src).toContain("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4");
    expect(src).not.toContain("auto-rows-fr");
  });
});
