import { APIError, createAuthMiddleware } from "better-auth/api";
import { EVENT } from "@/lib/event";
import { OTP_SEND_FAILED_CODE, OTP_SEND_FAILED_MESSAGE } from "@/lib/auth/otp-messages";
import { redactError } from "@/lib/auth/portal-access-email";


const SEND_OTP_PATH = "/email-otp/send-verification-otp";

type SendEmail = (params: { to: string; subject: string; html: string }) => Promise<{ ok: boolean; error?: string }>;
type Log = (message: string) => void;

/**
 * better-auth runs `sendVerificationOTP` through `runInBackgroundOrAwait`, which catches and logs anything it
 * throws, so the endpoint would still answer `{ success: true }`. Instead of throwing, a failed send is recorded
 * and `otpSendFailureHook` (an `after` hook, which may throw) turns it into an HTTP error.
 *
 * The mark is keyed by the incoming `Request` object, which is unique per HTTP request. (`ctx.context` is the shared
 * auth context and must not be used: concurrent requests would see each other's failures.)
 */
const failedRequests = new WeakSet<object>();

type RequestScoped = { request?: object | null };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

export function createSendVerificationOTP(deps: { sendEmail: SendEmail; log: Log }) {
  return async function sendVerificationOTP(
    { email, otp, type }: { email: string; otp: string; type: string },
    ctx?: RequestScoped | null,
  ) {
    if (type !== "sign-in") return;
    let failure: string | null = null;
    try {
      const result = await deps.sendEmail({
        to: email,
        subject: `${otp} is your ${EVENT.name} sign-in code`,
        html:
          `<p>Your sign-in code is <strong>${escapeHtml(otp)}</strong>. It expires in 10 minutes.</p>` +
          `<p>If you did not try to sign in to the ${escapeHtml(EVENT.name)} portal, ignore this email.</p>`,
      });
      if (!result.ok) failure = result.error ?? "provider refused the message";
    } catch (error) {
      // A rejected promise (network error, timeout) is a failed send too.
      failure = error instanceof Error ? error.message : String(error);
    }
    if (failure !== null) {
      // No address and no code in the log line; provider errors are scrubbed of addresses.
      deps.log(`sign-in code email failed: ${redactError(failure)}`);
      if (ctx?.request) failedRequests.add(ctx.request);
    }
  };
}

export const otpSendFailureHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== SEND_OTP_PATH || !ctx.request || !failedRequests.has(ctx.request)) return;
  failedRequests.delete(ctx.request);
  throw new APIError("INTERNAL_SERVER_ERROR", { message: OTP_SEND_FAILED_MESSAGE, code: OTP_SEND_FAILED_CODE });
});
