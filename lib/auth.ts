import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { twoFactor } from "better-auth/plugins/two-factor";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import { lumaRegistrant } from "@/db/schema/luma";
import { getAppUrl, getVercelOrigins } from "@/lib/app-url";
import { sendEmail } from "@/lib/email/send";
import { EVENT } from "@/lib/event";
import { normalizeEmail } from "@/lib/luma/email";
import { checkPortalSignIn, getSuperAdminEmails } from "@/lib/luma/service";

/** Endpoints that start or finish a passwordless sign-in; gated by the Luma guest list. */
const OTP_GATED_PATHS = new Set(["/email-otp/send-verification-otp", "/sign-in/email-otp"]);

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

async function assertGuestListAccess(email: string) {
  const decision = await checkPortalSignIn(email);
  if (!decision.allowed) {
    throw new APIError("FORBIDDEN", { message: decision.message, code: decision.code });
  }
}

function isAdminCallbackUrl(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  return value === "/admin/dashboard" || value.startsWith("/admin/");
}

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      getAppUrl(),
      // Preview deployments are reachable on both the unique and the branch URL.
      ...getVercelOrigins(),
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => {
        try {
          return new URL(value).origin;
        } catch {
          return value;
        }
      })
  )
);

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (OTP_GATED_PATHS.has(ctx.path)) {
        const email = typeof ctx.body?.email === "string" ? ctx.body.email : "";
        // Fail early (before any code is emailed) when the address is not on the guest list.
        await assertGuestListAccess(email);
        return;
      }

      if (ctx.path !== "/sign-up/email" || !isAdminCallbackUrl(ctx.body?.callbackURL)) {
        return;
      }

      const normalizedEmail =
        typeof ctx.body?.email === "string" ? ctx.body.email.toLowerCase() : "";
      const superAdminEmails = getSuperAdminEmails();

      if (superAdminEmails.size === 0) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Sign-up is disabled: SUPER_ADMIN_EMAILS is empty or not set. " +
            "On VPS/Dokploy set it in the app's Environment (not in a local .env file), then redeploy. " +
            "Locally: add SUPER_ADMIN_EMAILS=your@email.com to .env and restart the dev server.",
        });
      }

      if (!superAdminEmails.has(normalizedEmail)) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Sign-up failed. Your email must be in SUPER_ADMIN_EMAILS. " +
            "On VPS/Dokploy: set SUPER_ADMIN_EMAILS in the app Environment (e.g. your@email.com), redeploy, and use that exact email. " +
            "Check for typos and that the variable is set where the app runs (deployment env, not only local .env).",
        });
      }
    }),
  },
  plugins: [
    twoFactor({
      // Kept unchanged on purpose: renaming the issuer would confuse existing admin authenticator entries.
      issuer: "CURSOR 48H",
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        const result = await sendEmail({
          to: email,
          subject: `${otp} is your ${EVENT.name} sign-in code`,
          html:
            `<p>Your sign-in code is <strong>${escapeHtml(otp)}</strong>. It expires in 10 minutes.</p>` +
            `<p>If you did not try to sign in to the ${escapeHtml(EVENT.name)} portal, ignore this email.</p>`,
        });
        if (!result.ok) {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "We could not send the sign-in code. Please try again later or contact the organisers.",
          });
        }
      },
    }),
    // Must stay last so Set-Cookie headers from other plugins reach Next.js.
    nextCookies(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.user,
      account: authSchema.account,
      session: authSchema.session,
      verification: authSchema.verification,
      twoFactor: authSchema.twoFactor,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getAppUrl(),
  basePath: "/api/auth",
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  databaseHooks: {
    session: {
      create: {
        /**
         * Last line of defence for every sign-in method (email OTP, Google, GitHub, password):
         * no session is created for an email that is not on the Luma guest list,
         * unless it belongs to a super admin or staff member.
         */
        async before(nextSession) {
          const [owner] = await db
            .select({ email: authSchema.user.email })
            .from(authSchema.user)
            .where(eq(authSchema.user.id, nextSession.userId))
            .limit(1);
          if (!owner) return;
          await assertGuestListAccess(owner.email);
        },
      },
    },
    user: {
      create: {
        async before(nextUser) {
          const normalizedEmail =
            typeof nextUser.email === "string" ? normalizeEmail(nextUser.email) : "";
          const superAdminEmails = getSuperAdminEmails();

          if (!superAdminEmails.has(normalizedEmail)) {
            // Email-OTP sign-ups arrive without a name: take it from the Luma guest list.
            if (!nextUser.name) {
              const [guest] = await db
                .select({ name: lumaRegistrant.name })
                .from(lumaRegistrant)
                .where(eq(lumaRegistrant.email, normalizedEmail))
                .limit(1);
              const name = guest?.name?.trim() || normalizedEmail.split("@")[0];
              const [firstName, ...rest] = name.split(/\s+/);
              return {
                data: {
                  ...nextUser,
                  name,
                  firstName: firstName ?? null,
                  lastName: rest.join(" ") || null,
                },
              };
            }
            return;
          }

          return {
            data: {
              ...nextUser,
              role: "super_admin",
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: false },
      lastName: { type: "string", required: false, input: false },
      role: { type: "string", required: false, defaultValue: "participant", input: false },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      teamId: { type: "number", required: false, input: false },
      isTeamLead: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser(profile) {
              const p = profile as { given_name?: string; family_name?: string; name?: string };
              const rest = p.name?.split(" ").slice(1).join(" ");
              return {
                firstName: p.given_name ?? p.name?.split(" ")[0] ?? null,
                lastName: (p.family_name ?? rest) || null,
              };
            },
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            mapProfileToUser(profile) {
              const p = profile as { name?: string };
              const parts = (p.name ?? "").split(" ");
              return {
                firstName: parts[0] ?? null,
                lastName: parts.slice(1).join(" ") || null,
              };
            },
          },
        }
      : {}),
  },
});
