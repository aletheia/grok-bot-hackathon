import { jsonSuccess, toErrorResponse } from "@/lib/api/http";
import { listVoteProjects } from "@/lib/vote/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Submitted projects for the public jury page. No login. */
export async function GET() {
  try {
    const projects = await listVoteProjects();
    const response = jsonSuccess({ projects });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
