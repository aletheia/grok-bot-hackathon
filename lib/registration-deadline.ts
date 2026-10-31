import { EVENT } from "@/lib/event";
import { EVENT_TIME_ZONE } from "@/lib/time/rome";

const LOCALE = "en-GB";

/** "2 November" (calendar day in Rome) for the registration deadline in EVENT.registration. */
export function formatDeadlineDay(closes: Date = new Date(EVENT.registration.registrationCloses)): string {
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", timeZone: EVENT_TIME_ZONE }).format(closes);
}

/** "23:59" (24h, Rome time) for the registration deadline. */
export function formatDeadlineTime(closes: Date = new Date(EVENT.registration.registrationCloses)): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: EVENT_TIME_ZONE,
  }).format(closes);
}

/**
 * Deadline line of the event card on /register, driven by EVENT.registration.registrationCloses:
 * "Teams: register by 2 November, 23:59 (Rome time)." After the deadline: "Teams: registration closed on 2 November."
 * Returned in two parts so the label can be bold.
 */
export function getDeadlineLine(
  now: Date | number = Date.now(),
  closes: Date = new Date(EVENT.registration.registrationCloses),
): { label: string; text: string } {
  const t = typeof now === "number" ? now : now.getTime();
  if (t > closes.getTime()) return { label: "Teams:", text: `registration closed on ${formatDeadlineDay(closes)}.` };
  return { label: "Teams:", text: `register by ${formatDeadlineDay(closes)}, ${formatDeadlineTime(closes)} (Rome time).` };
}
