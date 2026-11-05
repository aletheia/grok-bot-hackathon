import type { NextRequest } from "next/server";
import { jsonSuccess, toErrorResponse } from "@/lib/api/http";
import { requireSuperAdminUser } from "@/lib/auth/session";
import { listSubmissionsForAdmin, submissionsToCsv } from "@/lib/submissions/service";
import { formatRome } from "@/lib/time/rome";

/** All active teams with their submission (repo, video, members). `?format=csv` downloads a CSV. */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdminUser(request);
    const rows = await listSubmissionsForAdmin();
    if (new URL(request.url).searchParams.get("format") === "csv") {
      return new Response(submissionsToCsv(rows, (iso) => formatRome(iso)), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="team-submissions.csv"',
          "Cache-Control": "no-store",
        },
      });
    }
    return jsonSuccess({ submissions: rows, total: rows.length, submitted: rows.filter((r) => r.githubUrl).length });
  } catch (error) {
    return toErrorResponse(error);
  }
}
