/**
 * Parser for Luma's guest-list CSV export.
 *
 * Luma exports one row per guest with columns such as `name`, `first_name`,
 * `last_name`, `email`, `approval_status`, `created_at`. Header names vary a
 * little between exports and tools that re-save the file, so headers are
 * matched case-insensitively with a few known aliases.
 */
import { normalizeEmail, isValidEmail } from "@/lib/luma/email";
import { normalizeLumaStatus } from "@/lib/luma/allowlist";

/** RFC 4180-ish CSV: quoted fields, "" escapes, commas/newlines inside quotes, CRLF, BOM. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const HEADER_ALIASES = {
  email: ["email", "e-mail", "email address", "e-mail address", "guest email", "user email"],
  name: ["name", "full name", "guest name", "user name"],
  firstName: ["first_name", "first name", "firstname", "given name"],
  lastName: ["last_name", "last name", "lastname", "surname", "family name"],
  status: ["approval_status", "approval status", "status", "registration status"],
  registeredAt: ["created_at", "created at", "registered_at", "registered at", "registration date", "registration time"],
} as const;

type HeaderKey = keyof typeof HEADER_ALIASES;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function mapHeaders(header: string[]): Partial<Record<HeaderKey, number>> {
  const normalized = header.map(normalizeHeader);
  const map: Partial<Record<HeaderKey, number>> = {};
  for (const key of Object.keys(HEADER_ALIASES) as HeaderKey[]) {
    const aliases = HEADER_ALIASES[key] as readonly string[];
    const index = normalized.findIndex((h) => aliases.includes(h) || aliases.includes(h.replace(/ /g, "_")));
    if (index >= 0) map[key] = index;
  }
  return map;
}

export type LumaGuest = {
  email: string;
  name: string | null;
  lumaStatus: string | null;
  lumaRegisteredAt: Date | null;
};

export type LumaCsvResult = {
  guests: LumaGuest[];
  /** 1-based data row numbers (header = row 1) skipped for a missing/invalid email. */
  skippedRows: number[];
  /** Emails that appeared more than once; the last occurrence wins. */
  duplicateEmails: string[];
  totalRows: number;
};

function parseDate(value: string | undefined): Date | null {
  if (!value || !value.trim()) return null;
  const d = new Date(value.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseLumaGuestCsv(input: string): LumaCsvResult {
  const rows = parseCsv(input);
  if (rows.length === 0) {
    throw new Error("The CSV file is empty.");
  }
  const map = mapHeaders(rows[0]);
  if (map.email === undefined) {
    throw new Error('No email column found. Expected a header such as "email".');
  }

  const byEmail = new Map<string, LumaGuest>();
  const duplicates = new Set<string>();
  const skippedRows: number[] = [];
  const cell = (row: string[], key: HeaderKey) => {
    const index = map[key];
    return index === undefined ? undefined : row[index]?.trim();
  };

  rows.slice(1).forEach((row, i) => {
    const email = normalizeEmail(cell(row, "email") ?? "");
    if (!isValidEmail(email)) {
      skippedRows.push(i + 2);
      return;
    }
    const fullName =
      cell(row, "name") ||
      [cell(row, "firstName"), cell(row, "lastName")].filter(Boolean).join(" ") ||
      null;
    const status = normalizeLumaStatus(cell(row, "status")) || null;
    if (byEmail.has(email)) duplicates.add(email);
    byEmail.set(email, {
      email,
      name: fullName,
      lumaStatus: status,
      lumaRegisteredAt: parseDate(cell(row, "registeredAt")),
    });
  });

  return {
    guests: [...byEmail.values()],
    skippedRows,
    duplicateEmails: [...duplicates],
    totalRows: rows.length - 1,
  };
}
