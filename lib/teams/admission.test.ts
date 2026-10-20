import { describe, expect, it } from "vitest";
import { computeAdmission, orderQueue, type AdmissionCandidate, type AdmissionTeam } from "@/lib/teams/admission";

function candidate(email: string, overrides: Partial<AdmissionCandidate> = {}): AdmissionCandidate {
  return {
    email,
    name: email.split("@")[0],
    userId: null,
    teamId: null,
    teamName: null,
    teamSize: 0,
    availableForTeam: false,
    lumaRegisteredAt: null,
    accountCreatedAt: null,
    importedAt: null,
    ...overrides,
  };
}

function team(id: number, size: number): AdmissionTeam {
  return {
    id,
    name: `Team ${id}`,
    members: Array.from({ length: size }, (_, i) => ({
      userId: `t${id}u${i}`,
      name: `T${id} U${i}`,
      email: `t${id}u${i}@example.com`,
    })),
  };
}

describe("FCFS ordering", () => {
  it("orders by Luma registration time, then account time, then import time, then email", () => {
    const ordered = orderQueue([
      candidate("d@x.com"),
      candidate("c@x.com", { importedAt: new Date("2026-10-10T00:00:00Z") }),
      candidate("b@x.com", { accountCreatedAt: new Date("2026-10-05T00:00:00Z") }),
      candidate("z@x.com", { lumaRegisteredAt: new Date("2026-09-02T00:00:00Z") }),
      candidate("a@x.com", { lumaRegisteredAt: new Date("2026-09-02T00:00:00Z") }),
      candidate("e@x.com", { lumaRegisteredAt: new Date("2026-09-01T00:00:00Z") }),
    ]);
    expect(ordered.map((c) => c.email)).toEqual(["e@x.com", "a@x.com", "z@x.com", "b@x.com", "c@x.com", "d@x.com"]);
    expect(ordered[0].orderedBy).toBe("luma_registration");
    expect(ordered.at(-1)?.orderedBy).toBe("none");
  });
});

describe("computeAdmission", () => {
  it("guarantees seats for formed teams (>= 4) and fills the rest FCFS", () => {
    const teams = [team(1, 6), team(2, 4), team(3, 3)];
    const formedMember = candidate("t1u0@example.com", {
      userId: "t1u0",
      lumaRegisteredAt: new Date("2026-01-01T00:00:00Z"),
    });
    const smallTeamMember = candidate("t3u0@example.com", {
      userId: "t3u0",
      teamId: 3,
      lumaRegisteredAt: new Date("2026-09-03T00:00:00Z"),
    });
    const solo = Array.from({ length: 5 }, (_, i) =>
      candidate(`solo${i}@x.com`, { lumaRegisteredAt: new Date(Date.UTC(2026, 8, 10 + i)) }),
    );

    const result = computeAdmission({
      capacity: 13,
      minMembers: 4,
      teams,
      candidates: [formedMember, smallTeamMember, ...solo],
    });

    expect(result.formedTeams.map((t) => t.id)).toEqual([1, 2]);
    expect(result.guaranteedSeats).toBe(10);
    expect(result.remainingSeats).toBe(3);
    // formed-team members are not queued
    expect(result.queue.find((q) => q.email === "t1u0@example.com")).toBeUndefined();
    expect(result.queue.map((q) => q.email)).toEqual([
      "t3u0@example.com",
      "solo0@x.com",
      "solo1@x.com",
      "solo2@x.com",
      "solo3@x.com",
      "solo4@x.com",
    ]);
    expect(result.queue.filter((q) => q.admitted).map((q) => q.position)).toEqual([1, 2, 3]);
    expect(result.admittedFromQueue).toBe(3);
  });

  it("never goes below zero remaining seats", () => {
    const result = computeAdmission({
      capacity: 5,
      minMembers: 4,
      teams: [team(1, 6)],
      candidates: [candidate("a@x.com")],
    });
    expect(result.guaranteedSeats).toBe(6);
    expect(result.remainingSeats).toBe(0);
    expect(result.queue[0].admitted).toBe(false);
  });
});
