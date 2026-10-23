/**
 * Europe/Rome time helpers (DST-correct, via Intl). Used for every event and
 * deadline time shown or entered in the portal.
 */
export const EVENT_TIME_ZONE = "Europe/Rome";

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Offset of `timeZone` from UTC at `date`, in minutes (Rome: +60 in winter, +120 in summer). */
export function zoneOffsetMinutes(date: Date, timeZone = EVENT_TIME_ZONE): number {
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/**
 * Interpret a wall-clock value in Rome ("YYYY-MM-DDTHH:mm", as from <input type="datetime-local">)
 * and return the UTC instant. Handles the DST switch: a skipped local time (spring gap) moves
 * forward, an ambiguous one (autumn overlap) resolves to the first occurrence.
 */
export function romeLocalToUtc(local: string, timeZone = EVENT_TIME_ZONE): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(local.trim());
  if (!m) throw new Error(`Invalid local date-time: ${local}`);
  const [, y, mo, d, h, mi, s] = m;
  const wallAsUtc = Date.UTC(+y, +mo - 1, +d, +h, +mi, s ? +s : 0);
  // Two passes converge for every real-world zone.
  let guess = wallAsUtc - zoneOffsetMinutes(new Date(wallAsUtc), timeZone) * 60000;
  const second = wallAsUtc - zoneOffsetMinutes(new Date(guess), timeZone) * 60000;
  if (second !== guess) {
    // Ambiguous/gap: prefer the earlier instant that still maps to (or past) the wall time.
    guess = Math.min(guess, second);
  }
  return new Date(guess);
}

/** UTC instant -> Rome wall-clock "YYYY-MM-DDTHH:mm" (for datetime-local inputs). */
export function utcToRomeLocal(date: Date | string, timeZone = EVENT_TIME_ZONE): string {
  const p = partsInZone(new Date(date), timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Human-readable Rome time, e.g. "31 Oct 2026, 23:59". */
export function formatRome(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    ...options,
  }).format(new Date(date));
}
