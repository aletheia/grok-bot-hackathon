import type { NextRequest } from "next/server";
import { jsonSuccess, parseJsonBody, toErrorResponse } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/auth/session";
import { getMyTeamSubmission, saveMyTeamSubmission, type SaveSubmissionInput } from "@/lib/submissions/service";

/** The signed-in member's team data submission (team, members, repo, video, deadline). */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireSessionUser(request);
    return jsonSuccess(await getMyTeamSubmission(actor));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Save or edit the submission. Any active member of the team, until the submission deadline. */
export async function PUT(request: NextRequest) {
  try {
    const actor = await requireSessionUser(request);
    const body = await parseJsonBody<SaveSubmissionInput>(request);
    return jsonSuccess(await saveMyTeamSubmission(actor, { githubUrl: body.githubUrl, videoUrl: body.videoUrl }));
  } catch (error) {
    return toErrorResponse(error);
  }
}
