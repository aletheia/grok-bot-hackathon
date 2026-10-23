import type { NextRequest } from "next/server";
import { jsonSuccess, toErrorResponse } from "@/lib/api/http";
import { requireSuperAdminUser } from "@/lib/auth/session";
import { getAdmissionOverview } from "@/lib/teams/admission-service";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdminUser(request);
    return jsonSuccess(await getAdmissionOverview());
  } catch (error) {
    return toErrorResponse(error);
  }
}
