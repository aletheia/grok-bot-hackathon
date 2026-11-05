import { describe, expect, it } from "vitest";
import { normalizeJurorName, parseJuryScores } from "./rules";

describe("normalizeJurorName", () => {
  it("trims and keeps internal spaces", () => {
    expect(normalizeJurorName("  Ada Lovelace  ")).toBe("Ada Lovelace");
  });

  it("rejects empty and non-strings", () => {
    expect(normalizeJurorName("   ")).toBeNull();
    expect(normalizeJurorName("")).toBeNull();
    expect(normalizeJurorName(12)).toBeNull();
  });

  it("rejects names longer than 200 characters", () => {
    expect(normalizeJurorName("a".repeat(201))).toBeNull();
    expect(normalizeJurorName("a".repeat(200))).toBe("a".repeat(200));
  });
});

describe("parseJuryScores", () => {
  const row = { teamId: 3, innovation: 5, scalability: 4, marketReadiness: 1 };

  it("accepts integers 1 through 5", () => {
    expect(parseJuryScores([row])).toEqual([row]);
    expect(parseJuryScores([{ ...row, innovation: "5", teamId: "3" }])).toEqual([row]);
  });

  it("rejects 0, 6, fractions, and partial rows", () => {
    expect(parseJuryScores([{ ...row, innovation: 0 }])).toBeNull();
    expect(parseJuryScores([{ ...row, scalability: 6 }])).toBeNull();
    expect(parseJuryScores([{ ...row, marketReadiness: 1.5 }])).toBeNull();
    expect(parseJuryScores([{ teamId: 3, innovation: 5 }])).toBeNull();
    expect(parseJuryScores([])).toBeNull();
    expect(parseJuryScores([{ ...row }, { ...row }])).toBeNull();
  });
});
