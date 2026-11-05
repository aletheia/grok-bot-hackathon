import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Jury } from "@/components/landing/Jury";
import { EVENT } from "@/lib/event";
import { buildEventJsonLd } from "@/lib/event-jsonld";
import { t } from "@/lib/i18n";
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
  it("no prizes section on the landing and no #prizes link anywhere in the app", () => {
    const files = ["app/page.tsx", "components/Navigation.tsx", "components/landing/index.ts", "app/tracks/page.tsx", "app/rules/page.tsx"];
    for (const f of files) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      expect(src, f).not.toMatch(/<Prizes\b|#prizes|'prizes'/);
    }
    expect(existsSync(join(process.cwd(), "components/landing/Prizes.tsx"))).toBe(false);
  });
});

describe("jury grid", () => {
  it("2 columns on mobile, 3 on md, 4 on lg; rows not forced to equal height", () => {
    const src = readFileSync(join(process.cwd(), "components/landing/Jury.tsx"), "utf8");
    expect(src).toContain("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4");
    expect(src).not.toContain("auto-rows-fr");
  });
});

describe("evaluation criteria are not published", () => {
  it("keeps the list empty and does not render a criteria card or announcement", () => {
    expect(EVENT.criteria).toEqual([]);
    const html = renderToStaticMarkup(createElement(Jury));
    expect(html).toContain(t("landing", "juryTitle"));
    expect(html).not.toContain(t("landing", "criteriaTitle"));
    expect(html).not.toContain(t("landing", "tbaNote"));
    expect(html).not.toMatch(/innovation|scalability|real use cases|deliverable/i);
  });
});

describe("brief", () => {
  it("asks builders to show something by today at 16:30", () => {
    expect(EVENT.brief).toBe(
      "Pick a piece of hardware, an API, connect it to Grok (the API, Grok Voice, or the bot framework), and by today at 16:30 show something that didn't work when you started.",
    );
    expect(EVENT.brief).not.toMatch(/Thursday afternoon/i);
  });
});

describe("schedule", () => {
  it("the 18:30 item on the last day is the awards ceremony", () => {
    const [wed, last] = EVENT.schedule;
    expect(last.items.find((i) => i.time === "18:30")?.title).toBe("Awards ceremony");
    expect(last.items.find((i) => i.time === "21:00")).toBeUndefined();
    expect(wed.items.find((i) => i.time === "18:30")?.title).toBe("Riso Scotti meets the Hackathon");
    expect(wed.items.find((i) => !i.time)?.detail).toContain("until Thursday at 21:00");
    expect(t("landing", "overnightNote")).toContain("until Thursday at 21:00");
    expect(JSON.stringify(EVENT.schedule)).not.toMatch(/closing/i);
  });

  it("follows the agenda outline (Wednesday 10:00, 11:00, 18:30; Thursday 12:00 Ralph, no MESetAs)", () => {
    const [wed, thu] = EVENT.schedule;
    const talks = (items: readonly { time?: string; title: string }[], times: string[]) =>
      items.filter((i) => times.includes(i.time ?? "")).map((i) => `${i.time} ${i.title}`);
    expect(talks(wed.items, ["10:00", "11:00", "18:30"])).toEqual([
      "10:00 Intro to cobots, dogs, drones and rovers",
      "11:00 Factory Academia",
      "18:30 Riso Scotti meets the Hackathon",
    ]);
    expect(talks(thu.items, ["10:00", "10:30", "11:00", "11:30", "12:00"])).toEqual([
      "12:00 Talk by Ralph Johnson (SpaceXAI)",
    ]);
    expect(JSON.stringify(EVENT.schedule)).not.toMatch(/MESetAs|Mesetas/i);
    // Nothing implies Ralph speaks at 09:00, 10:00, or 11:30.
    expect(EVENT.speaker.bio).toContain("12:00");
    expect(EVENT.speaker.bio).not.toContain("11:30");
    expect(EVENT.speaker.bio).not.toContain("10:00");
    expect(EVENT.speaker.bio).not.toMatch(/opens the day/i);
    const build = thu.items.find((i) => i.time === "09:00");
    expect(build?.title).toBe("Build");
    expect(build?.endTime).toBe("16:30");
    expect(build?.detail).toBe("Ralph joins the tables after his 12:00 talk.");
    const evaluation = thu.items.find((i) => i.title === "Project evaluation and pitches");
    expect(evaluation).toEqual({ time: "16:30", endTime: "18:30", title: "Project evaluation and pitches" });
  });
});
