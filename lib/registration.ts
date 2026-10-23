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

export type RegistrationNotice = {
  state: RegistrationState;
  headline: string;
  /** Who can register and why a team helps. Empty once registration is closed. */
  body: string;
};

const BODY =
  "Register a team and share its secret code, or join a team with a code from a teammate. On your own? Register as looking for a team. Registering a team gives priority for participation confirmation.";

export function getRegistrationNotice(
  now: Date | number = Date.now(),
  opens: Date = REGISTRATION_OPENS_AT,
  closes: Date = REGISTRATION_CLOSES_AT,
): RegistrationNotice {
  const state = getRegistrationState(now, opens, closes);
  const open = formatRegistrationDay(opens);
  const close = formatRegistrationDay(closes);
  if (state === "before") {
    return { state, headline: `Registration opens on ${open} and runs until ${close}.`, body: BODY };
  }
  if (state === "open") {
    return { state, headline: `Registration is open until ${close} (23:59, Rome time).`, body: BODY };
  }
  return { state, headline: `Registration closed on ${close}.`, body: "" };
}
