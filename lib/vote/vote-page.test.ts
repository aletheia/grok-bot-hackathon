import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(path.join(process.cwd(), "public/vote.html"), "utf8");
const config = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");

const TEAMS = [
  "aidea",
  "B.M.O.",
  "Big AI",
  "Coding bananas",
  "I Cavalli",
  "Kakashi Venture Accelerator",
  "Mesappers",
  "Meteora",
  "Overclocked",
  "PvPv",
  "Secrecy",
  "Snap2Run",
  "Vivido x ICIB",
  "XXX",
];

describe("public jury page", () => {
  it("keeps Pixel's page and drops sandbox font files", () => {
    expect(page).toContain("Jury scoring");
    expect(page).toContain("fonts.googleapis.com");
    expect(page).not.toContain("/usr/share/fonts");
    expect(page).toContain("/api/vote/projects");
    expect(page).toContain("/api/vote");
  });

  it("seeds the 14 submitted projects, including demo links", () => {
    for (const name of TEAMS) expect(page).toContain(name);
    expect(page).toContain("https://github.com/aidea-team/grokbot-hackathon");
    expect(page).toContain("https://youtu.be/ojegjFnB07k");
    expect(page).not.toContain("AAA Battery");
    expect(page).not.toContain("Quelli_della_Grigliata");
    expect(page).not.toContain("agrikesici");
  });

  it("rewrites /vote to the static file", () => {
    expect(config).toContain('source: "/vote"');
    expect(config).toContain('destination: "/vote.html"');
  });
});
