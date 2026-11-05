import { EVENT } from "@/lib/event";
import { EVENT_TIME_ZONE } from "@/lib/time/rome";

/** Where "now" sits relative to the team registration window. */
export type RegistrationState = "before" | "open" | "closed";

export const REGISTRATION_OPENS_AT = new Date(EVENT.registration.registrationOpens);
export const REGISTRATION_CLOSES_AT = new Date(EVENT.registration.registrationCloses);

/** Opens at registrationOpens (inclusive) and closes after registrationCloses (inclusive end). */
export function getRegistrationState(
  now: Date | number = Date.now(),
  opens: Date = REGISTRATION_OPENS_AT,
  closes: Date = REGISTRATION_CLOSES_AT,
): RegistrationState {
  const t = typeof now === "number" ? now : now.getTime();
  if (t < opens.getTime()) return "before";
  if (t > closes.getTime()) return "closed";
  return "open";
}

/** "October 26" (calendar day in Rome). */
export function formatRegistrationDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: EVENT_TIME_ZONE }).format(date);
}

/** "16:30" (24h, Rome time). */
export function formatRegistrationTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

export type RegistrationNotice = {
  state: RegistrationState;
  headline: string;
  /** What is possible until the deadline; after it, a one-line "locked and closed" note. */
  body: string;
};

const BODY =
  "Until then you can register a team and share its secret code, join a team with a code from a teammate, or register as looking for a team. Team creation and joining lock at the same moment. Registering a team gives priority for participation confirmation.";

const CLOSED_BODY = "Teams are locked and team data submissions are closed.";

export function getRegistrationNotice(
  now: Date | number = Date.now(),
  opens: Date = REGISTRATION_OPENS_AT,
  closes: Date = REGISTRATION_CLOSES_AT,
): RegistrationNotice {
  const state = getRegistrationState(now, opens, closes);
  const close = formatRegistrationDay(closes);
  // Deadline only: the opening date is deliberately not advertised, so the pre-opening and open
  // states show the same line. The "before" state still exists as a gate in getRegistrationState.
  if (state === "before" || state === "open") {
    return { state, headline: `Final Deadline for submission: ${close}, ${formatRegistrationTime(closes)} (Rome time).`, body: BODY };
  }
  return {
    state,
    headline: `The Final Deadline for submission (${close}, ${formatRegistrationTime(closes)}, Rome time) has passed.`,
    body: CLOSED_BODY,
  };
}
