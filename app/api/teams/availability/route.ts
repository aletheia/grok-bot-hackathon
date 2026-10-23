import type { NextRequest } from "next/server";
import { AppError, jsonSuccess, parseJsonBody, toErrorResponse } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/auth/session";
import { TEAM_LIMITS } from "@/lib/teams/constants";
import { getAvailability, setAvailability } from "@/lib/teams/service";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireSessionUser(request);
    return jsonSuccess(await getAvailability(actor));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Body: { available: boolean, note?: string } */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireSessionUser(request);
    const body = await parseJsonBody<{ available?: unknown; note?: unknown }>(request);
    if (typeof body.available !== "boolean") {
      throw new AppError(400, "INVALID_INPUT", "available must be true or false.");
    }
    let note: string | null = null;
    if (body.note !== undefined && body.note !== null) {
      if (typeof body.note !== "string") throw new AppError(400, "INVALID_INPUT", "note must be text.");
      note = body.note.trim() || null;
      if (note && note.length > TEAM_LIMITS.availableNoteMaxLength) {
        throw new AppError(
          400,
          "INVALID_INPUT",
          `The note can be at most ${TEAM_LIMITS.availableNoteMaxLength} characters.`,
        );
      }
    }
    return jsonSuccess(await setAvailability(actor, { available: body.available, note }));
  } catch (error) {
    return toErrorResponse(error);
  }
}
