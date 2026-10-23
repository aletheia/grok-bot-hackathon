import type { NextRequest } from "next/server";
import { AppError, jsonSuccess, parseJsonBody, toErrorResponse } from "@/lib/api/http";
import { requireSuperAdminUser } from "@/lib/auth/session";
import { parseLumaGuestCsv } from "@/lib/luma/csv";
import { importLumaGuests, listLumaRegistrants } from "@/lib/luma/service";

const MAX_CSV_BYTES = 5 * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdminUser(request);
    const items = await listLumaRegistrants();
    return jsonSuccess({ total: items.length, items });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Body: { csv: string } — the Luma guest-list CSV export. Upserts by email; never deletes. */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdminUser(request);
    const body = await parseJsonBody<{ csv?: unknown }>(request);
    if (typeof body.csv !== "string" || !body.csv.trim()) {
      throw new AppError(400, "INVALID_INPUT", "Upload the Luma guest CSV.");
    }
    if (body.csv.length > MAX_CSV_BYTES) {
      throw new AppError(413, "CSV_TOO_LARGE", "The CSV is larger than 5 MB.");
    }
    let parsed;
    try {
      parsed = parseLumaGuestCsv(body.csv);
    } catch (error) {
      throw new AppError(400, "INVALID_CSV", error instanceof Error ? error.message : "Invalid CSV.");
    }
    const counts = await importLumaGuests(parsed.guests);
    return jsonSuccess({
      totalRows: parsed.totalRows,
      imported: parsed.guests.length,
      inserted: counts.inserted,
      updated: counts.updated,
      skippedRows: parsed.skippedRows,
      duplicateEmails: parsed.duplicateEmails.length,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
