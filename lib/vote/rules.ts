/** Pure checks for the public jury ballot. Scores are 1–5, not the admin weighted rubric. */

export type JuryScoreInput = {
  teamId: number;
  innovation: number;
  scalability: number;
  marketReadiness: number;
};

const MAX_NAME = 200;
const MAX_SCORES = 100;

export function normalizeJurorName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim();
  if (!name || name.length > MAX_NAME) return null;
  return name;
}

export function parseJuryScores(raw: unknown): JuryScoreInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_SCORES) return null;
  const scores: JuryScoreInput[] = [];
  const seen = new Set<number>();
  for (const item of raw) {
    const score = parseJuryScore(item);
    if (!score || seen.has(score.teamId)) return null;
    seen.add(score.teamId);
    scores.push(score);
  }
  return scores;
}

function parseJuryScore(raw: unknown): JuryScoreInput | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const teamId = parseTeamId(row.teamId);
  const innovation = parsePoints(row.innovation);
  const scalability = parsePoints(row.scalability);
  const marketReadiness = parsePoints(row.marketReadiness);
  if (teamId === null || innovation === null || scalability === null || marketReadiness === null) {
    return null;
  }
  return { teamId, innovation, scalability, marketReadiness };
}

function parseTeamId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^[1-9]\d*$/.test(value)) {
    const n = Number(value);
    return n <= Number.MAX_SAFE_INTEGER ? n : null;
  }
  return null;
}

/** Integers 1 through 5 only. Zero is rejected. */
function parsePoints(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5) return value;
  if (typeof value === "string" && /^[1-5]$/.test(value)) return Number(value);
  return null;
}
