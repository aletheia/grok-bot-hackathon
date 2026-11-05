import { EVENT } from "@/lib/event";
import { EVENT_TIME_ZONE } from "@/lib/time/rome";

const LOCALE = "en-GB";

/** "5 November" (calendar day in Rome) for the registration deadline in EVENT.registration. */
export function formatDeadlineDay(closes: Date = new Date(EVENT.registration.registrationCloses)): string {
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", timeZone: EVENT_TIME_ZONE }).format(closes);
}

/** "16:00" (24h, Rome time) for the registration deadline. */
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
 * "Final Deadline for submission: 5 November, 16:00 (Rome time)."
 * After the deadline: "Final Deadline for submission: passed on 5 November, 16:00 (Rome time)."
 * Returned in two parts so the label can be bold.
 */
export function getDeadlineLine(
  now: Date | number = Date.now(),
  closes: Date = new Date(EVENT.registration.registrationCloses),
): { label: string; text: string } {
  const t = typeof now === "number" ? now : now.getTime();
  const label = "Final Deadline for submission:";
  const when = `${formatDeadlineDay(closes)}, ${formatDeadlineTime(closes)} (Rome time).`;
  if (t > closes.getTime()) return { label, text: `passed on ${when}` };
  return { label, text: when };
}
