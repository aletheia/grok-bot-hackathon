import { describe, expect, it } from "vitest";
import { EVENT } from "@/lib/event";
import { TBC, TRACKS_CONTENT } from "@/lib/tracks";

describe("proposed tracks", () => {
  it("has the ten tracks in order (A–D by companies, 01–06 open), labelled as proposed", () => {
    expect(EVENT.tracks).toBe(TRACKS_CONTENT);
    expect(TRACKS_CONTENT.status).toBe("proposed");
    expect(TRACKS_CONTENT.items.map((t) => t.number)).toEqual(["A", "B", "C", "D", "01", "02", "03", "04", "05", "06"]);
    expect(TRACKS_CONTENT.items.map((t) => t.title)).toEqual([
      "CTRL+F: SEA",
      "B.R.C. Best Rice Company: Autonomous Company",
      "Labelling from the Model Pack",
      "Robot Dog Patrol",
      "Research Radar",
      "GitHub Benchmark Arena",
      "Agent Failure Lab",
      "Voice Control",
      "Robot Skill Passport",
      "LabOS",
    ]);
    expect(TRACKS_CONTENT.items.filter((t) => t.kind === "company").map((t) => t.proposedBy)).toEqual([
      "SEA Vision",
      "Riso Scotti",
      "Cristina Portinaro Cosmetics",
      "Riello",
    ]);
    for (const t of TRACKS_CONTENT.items.filter((t) => t.kind === "open")) expect(t.proposedBy).toBe("Organisers");
  });

  it("keeps the ids of the tracks already published on /tracks", () => {
    expect(TRACKS_CONTENT.items.filter((t) => ["01", "02", "03"].includes(t.number)).map((t) => t.id)).toEqual([
      "research-radar",
      "github-benchmark-arena",
      "agent-failure-lab",
    ]);
  });

  it("has unique anchors and every field of the track card", () => {
    const ids = TRACKS_CONTENT.items.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TRACKS_CONTENT.items) {
      expect(t.oneLiner.endsWith("?")).toBe(true);
      for (const field of [t.summary, t.hardwareSummary, t.context, t.build, t.inputs, t.grok, t.outOfScope, t.judging, t.hardware, t.mentors]) {
        expect(field.length).toBeGreaterThan(0);
      }
      expect(t.demo.items.length).toBeGreaterThan(0);
      expect(t.stretch.length).toBeGreaterThan(0);
    }
  });

  it("only the Agent Failure Lab has a failure taxonomy", () => {
    expect(TRACKS_CONTENT.items.filter((t) => t.taxonomy).map((t) => t.id)).toEqual(["agent-failure-lab"]);
  });

  it("publishes the rules for all tracks", () => {
    expect(TRACKS_CONTENT.rules).toHaveLength(5);
    expect(TRACKS_CONTENT.rules.join("\n")).toContain("by 17:00");
    expect(TRACKS_CONTENT.rules.join("\n")).not.toContain("by 16:30");
    expect(TRACKS_CONTENT.rules.join("\n")).not.toContain("by 16:00");
  });

  it("marks unconfirmed items with the TBC marker, never with raw Italian notes", () => {
    const text = JSON.stringify(TRACKS_CONTENT);
    expect(text).not.toMatch(/da confermare/i);
    expect(text).toContain(TBC);
    // Mentors still to be confirmed: Riso Scotti, Cristina Portinaro Cosmetics, Riello and all open tracks.
    expect(TRACKS_CONTENT.items.filter((t) => t.mentors.includes(TBC)).map((t) => t.number)).toEqual([
      "B", "C", "D", "01", "02", "03", "04", "05", "06",
    ]);
  });

  it("does not publish internal material codes or open points", () => {
    const text = JSON.stringify(TRACKS_CONTENT);
    expect(text).not.toMatch(/\bM\d+\b/);
    expect(text.toLowerCase()).not.toContain("open point");
    expect(text.toLowerCase()).not.toContain("punti aperti");
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
    // Jury: names only until Luca confirms the rest (no invented roles/bios); no "to be announced" card.
    // Ralph Johnson (the speaker) is the exception: role and official photo (no separate org: the role already names SpaceXAI) as on his speaker card.
    expect(EVENT.jury.map((j) => j.name)).toEqual(["Luca Bianchi", "Lorenzo Cerri", "Alessandro Rano", "Alberto Giusti", "Claudio Peroni", "Ralph Johnson", "Federico Pellegrini"]);
    for (const j of EVENT.jury) {
      if (j.name === "Ralph Johnson") expect(j).toEqual({ name: "Ralph Johnson", role: "SpaceXAI team", photo: "/assets/speaker/ralph-johnson.jpg" });
      else if (j.name === "Luca Bianchi") expect(j).toEqual({ name: "Luca Bianchi", photo: "/assets/jury/luca-bianchi.jpg" });
      else expect(Object.keys(j)).toEqual(["name"]);
    }
  });
});
