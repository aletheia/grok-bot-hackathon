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
  "You can register as an individual looking for a team, or as a team, naming the other participants. Registering as a team gives priority for participation confirmation.";

export function getRegistrationNotice(
  now: Date | number = Date.now(),
  opens: Date = REGISTRATION_OPENS_AT,
  closes: Date = REGISTRATION_CLOSES_AT,
): RegistrationNotice {
  const state = getRegistrationState(now, opens, closes);
  const open = formatRegistrationDay(opens);
  const close = formatRegistrationDay(closes);
  if (state === "before") {
    return { state, headline: `Team registration opens on ${open} and runs until ${close}.`, body: BODY };
  }
  if (state === "open") {
    return { state, headline: `Team registration is open until ${close} (23:59, Rome time).`, body: BODY };
  }
  return { state, headline: `Team registration closed on ${close}.`, body: "" };
}
