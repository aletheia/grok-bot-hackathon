import { EVENT } from "@/lib/event";
import { isValidEmail, normalizeEmail } from "@/lib/luma/email";

/** Why a sign-in was refused. Declined guests are deliberately not emailed. */
export type PortalAccessReason = "not_on_list" | "not_approved" | "declined";

export type PortalAccessEmailOutcome = "sent" | "skipped" | "throttled" | "failed";

/** At most one such email per address per 24 hours, and a small per-IP cap (see PR description). */
export const EMAIL_LIMIT = { windowSeconds: 24 * 60 * 60, max: 1 } as const;
export const IP_LIMIT = { windowSeconds: 60 * 60, max: 5 } as const;

const MAX_EMAIL_LENGTH = 254;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

/** Strict enough to never put a header-injection or garbage string in a `to` field. */
export function isSendableAddress(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && !/[\s,;<>"'\\]/.test(email) && isValidEmail(email);
}

export function buildPortalAccessEmail(
  reason: Exclude<PortalAccessReason, "declined">,
): { subject: string; html: string } {
  const url = EVENT.registration.url;
  const name = escapeHtml(EVENT.name);
  const ignore = `<p>If this was not you, you can safely ignore this email.</p>`;
  if (reason === "not_on_list") {
    return {
      subject: `Register on Luma to join ${EVENT.name}`,
      html:
        `<p>Hi,</p>` +
        `<p>Someone tried to sign in to the ${name} portal with this email address, but we could not find a registration for it.</p>` +
        `<p>To take part, please register on Luma with <strong>this same email address</strong>: ` +
        `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` +
        `<p>Only registrants approved by the organisers can sign in to the portal.</p>` +
        ignore,
    };
  }
  return {
    subject: `Your ${EVENT.name} registration is not approved yet`,
    html:
      `<p>Hi,</p>` +
      `<p>Someone tried to sign in to the ${name} portal with this email address. ` +
      `Your registration is not approved yet, so you cannot sign in for now.</p>` +
      `<p>The organisers will confirm your status by Luma. There is no need to register again; ` +
      `once you are approved, sign in with this same email address.</p>` +
      ignore,
  };
}

export type PortalAccessEmailDeps = {
  sendEmail: (params: { to: string; subject: string; html: string }) => Promise<{ ok: boolean; error?: string }>;
  /** Returns true while the key is within its limit (and counts the event). */
  consume: (key: { kind: "ip" | "email"; value: string }, windowSeconds: number, max: number) => Promise<boolean>;
  log: (message: string) => void;
};

/**
 * Emails someone whose sign-in was refused because they are not (yet) approved on Luma.
 * Never throws and never changes the HTTP answer; abuse limits are checked before any send.
 */
export async function sendPortalAccessEmail(
  input: { email: string; reason: PortalAccessReason; ip: string | null },
  deps: PortalAccessEmailDeps,
): Promise<PortalAccessEmailOutcome> {
  if (input.reason === "declined") return "skipped";
  const email = normalizeEmail(input.email);
  if (!isSendableAddress(email)) return "skipped";
  try {
    // IP first: repeated requests for the same address then cannot be used to burn through other limits.
    if (!(await deps.consume({ kind: "ip", value: input.ip ?? "unknown" }, IP_LIMIT.windowSeconds, IP_LIMIT.max))) {
      return "throttled";
    }
    if (!(await deps.consume({ kind: "email", value: email }, EMAIL_LIMIT.windowSeconds, EMAIL_LIMIT.max))) {
      return "throttled";
    }
    const result = await deps.sendEmail({ to: email, ...buildPortalAccessEmail(input.reason) });
    if (!result.ok) {
      deps.log(`portal access email (${input.reason}) was not sent: ${redactError(result.error)}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    // Includes a missing email_throttle table: fail closed (no email) and keep the normal 403.
    deps.log(`portal access email (${input.reason}) skipped: ${redactError(error instanceof Error ? error.message : String(error))}`);
    return "failed";
  }
}

/** Provider errors can echo recipient addresses; keep logs free of them and short. */
export function redactError(value: string | undefined): string {
  return (value ?? "unknown error").replace(/[^\s"'<>(),;]+@[^\s"'<>(),;]+/g, "[email]").slice(0, 200);
}
