import type { NextRequest } from "next/server";
import { jsonSuccess, parseJsonBody, toErrorResponse } from "@/lib/api/http";
import { listVotesForJuror, upsertJuryVotes } from "@/lib/vote/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** This juror's saved scores. `?juror=` is the free-text name. No login. */
export async function GET(request: NextRequest) {
  try {
    const juror = new URL(request.url).searchParams.get("juror") ?? "";
    const data = await listVotesForJuror(juror);
    const response = jsonSuccess(data);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Upsert 1–5 scores for the named juror. Body: `{ jurorName, scores: [{ teamId, innovation, scalability, marketReadiness }] }`. */
export async function PUT(request: NextRequest) {
  try {
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const data = await upsertJuryVotes(body.jurorName, body.scores);
    const response = jsonSuccess(data);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
