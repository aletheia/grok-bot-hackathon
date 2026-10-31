import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { TRACKS_CONTENT } from "@/lib/tracks";

describe("proposed tracks", () => {
  it("has the three tracks in order, labelled as proposed", () => {
    expect(EVENT.tracks).toBe(TRACKS_CONTENT);
    expect(TRACKS_CONTENT.status).toBe("proposed");
    expect(TRACKS_CONTENT.items.map((t) => t.title)).toEqual([
      "Research Radar",
      "GitHub Benchmark Arena",
      "Agent Failure Lab",
    ]);
    expect(TRACKS_CONTENT.items.map((t) => t.number)).toEqual(["01", "02", "03"]);
  });

  it("has unique anchors and the fields the cards need", () => {
    const ids = TRACKS_CONTENT.items.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TRACKS_CONTENT.items) {
      expect(t.guidingQuestion.endsWith("?")).toBe(true);
      expect(t.mainResult.length).toBeGreaterThan(0);
      expect(t.coreFeatures.length).toBeGreaterThan(0);
      expect(t.mvp.length).toBeGreaterThan(0);
      expect(t.stretch.length).toBeGreaterThan(0);
    }
  });

  it("only the Arena has a risks section", () => {
    expect(TRACKS_CONTENT.items.filter((t) => t.risks).map((t) => t.id)).toEqual(["github-benchmark-arena"]);
  });

  it("does not publish the rubric, eligibility, phase table or optional prizes", () => {
    const text = JSON.stringify(TRACKS_CONTENT).toLowerCase();
    for (const banned of ["100 points", "rubric score", "eligibility", "phase", "optional prize", "points"]) {
      expect(text).not.toContain(banned);
    }
  });

  it("keeps criteria, prizes and jury as announcements", () => {
    expect(EVENT.criteria).toEqual([]);
    expect(EVENT.prizes).toEqual([]);
    // Jury: names only until Luca confirms the rest (no invented roles/bios), plus one "to be announced" card.
    // Ralph Johnson (the speaker) is the exception: affiliation SpaceXAI and his official photo, as Luca sent them.
    expect(EVENT.jury.map((j) => j.name)).toEqual(["Luca Bianchi", "Lorenzo Cerri", "Alessandro Rano", "Alberto Giusti", "Claudio Peroni", "Ralph Johnson", "Federico Pellegrini", null]);
    for (const j of EVENT.jury) {
      if (j.name === "Ralph Johnson") expect(j).toEqual({ name: "Ralph Johnson", org: "SpaceXAI", photo: "/assets/speaker/ralph-johnson.jpg" });
      else expect(Object.keys(j)).toEqual(["name"]);
    }
  });
});
