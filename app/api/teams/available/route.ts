import type { NextRequest } from "next/server";
import { jsonSuccess, toErrorResponse } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/auth/session";
import { listAvailableParticipants } from "@/lib/teams/service";

/** People available to join a team. Visible to team members; never includes email addresses. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireSessionUser(request);
    return jsonSuccess({ items: await listAvailableParticipants(actor) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
