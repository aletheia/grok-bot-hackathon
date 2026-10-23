import type { NextRequest } from "next/server";
import { AppError, jsonSuccess, toErrorResponse } from "@/lib/api/http";
import { requireSuperAdminUser } from "@/lib/auth/session";
import { LumaApiError, getLumaConfig } from "@/lib/luma/client";
import { getLastLumaSync, syncLumaGuestsFromApi } from "@/lib/luma/service";

/** Sync status: whether the Luma API is configured and the counts of the last sync (no guest data). */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdminUser(request);
    return jsonSuccess({ configured: getLumaConfig() !== null, lastSync: await getLastLumaSync() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Reads every guest of the event from Luma (GET only) and upserts their approval status. Super admins only. */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdminUser(request);
    if (!getLumaConfig()) {
      throw new AppError(
        503,
        "LUMA_NOT_CONFIGURED",
        "The Luma API is not configured (LUMA_API_KEY is missing). Use the CSV import instead.",
      );
    }
    try {
      return jsonSuccess(await syncLumaGuestsFromApi());
    } catch (error) {
      if (error instanceof LumaApiError) {
        throw new AppError(
          502,
          "LUMA_API_ERROR",
          `Luma could not be read (${error.status ? `HTTP ${error.status}` : error.message}). Nothing was changed; try again or use the CSV import.`,
        );
      }
      throw error;
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
