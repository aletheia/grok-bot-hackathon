"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  OTP_LATEST_ONLY_HINT,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_SEND_FAILED_MESSAGE,
  otpVerifyErrorMessage,
  sanitizeOtp,
} from "@/lib/auth/otp-messages";
import { EVENT } from "@/lib/event";
import { Logo, NoiseOverlay } from "@/components/ui";
import { RegistrationNotice } from "@/components/RegistrationNotice";

const LOADING_UI = (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
    <div className="text-[var(--text-muted)]">Loading...</div>
  </div>
);

type Step = "email" | "code";

function errorMessage(error: unknown, fallback: string) {
  const err = error as { message?: string; status?: number } | null;
  if (err?.status === 429) return "Too many attempts. Please wait a minute and try again.";
  return err?.message?.trim() || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lumaHint, setLumaHint] = useState<null | "register" | "status">(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, router, session]);

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setLumaHint(null);
    setBusy(true);
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });
      if (sendError) {
        const { status, code } = sendError as { status?: number; code?: string };
        if (status === 403) setLumaHint(code === "LUMA_NOT_APPROVED" ? "status" : "register");
        setError(errorMessage(sendError, OTP_SEND_FAILED_MESSAGE));
        return;
      }
      setCode("");
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setStep("code");
    } catch {
      setError("Cannot reach the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: signInError } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp: sanitizeOtp(code),
      });
      if (signInError) {
        const { code: errorCode } = signInError as { code?: string };
        setError(
          otpVerifyErrorMessage(errorCode) ??
            errorMessage(signInError, "That code did not work. Check it or request a new one."),
        );
        return;
      }
      router.replace("/dashboard");
    } catch {
      setError("Cannot reach the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (isPending || session?.user) {
    return (
      <>
        <NoiseOverlay />
        {LOADING_UI}
      </>
    );
  }

  const resendButton = (
    <button
      type="button"
      onClick={() => void sendCode()}
      disabled={busy || cooldown > 0}
      className="text-[var(--text-muted)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {cooldown > 0 ? `Send a new code (${cooldown}s)` : "Send a new code"}
    </button>
  );

  const inputClass =
    "w-full rounded-xl border border-[var(--border-color)] bg-black/40 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none";
  const buttonClass =
    "w-full inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <>
      <NoiseOverlay />
      <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
        <div className="w-full max-w-md">
          <RegistrationNotice className="mb-6" />
          <div className="glass-card p-8 sm:p-10 flex flex-col items-center text-center">
            <Logo size={48} className="mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Sign in to the team portal</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Use the <strong className="text-white">same email you used to register on Luma</strong> for{" "}
              {EVENT.name}. We will email you a 6-digit code — no password needed.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Once you are in, you can <strong className="text-white">register a team</strong> and get its code,{" "}
              <strong className="text-white">join a team</strong> with a code, or register as{" "}
              <strong className="text-white">looking for a team</strong>.
            </p>

            {error ? (
              <div
                role="alert"
                className="mb-6 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200"
              >
                <p>{error}</p>
                {step === "code" ? <div className="mt-2 text-sm">{resendButton}</div> : null}
                {lumaHint ? (
                  <a
                    href={EVENT.registration.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-semibold text-white underline"
                  >
                    {lumaHint === "status" ? "Check your registration on Luma →" : "Register on Luma →"}
                  </a>
                ) : null}
              </div>
            ) : null}

            {step === "email" ? (
              <form onSubmit={sendCode} className="w-full space-y-4 text-left">
                <label className="block text-sm font-medium text-[var(--text-secondary)]" htmlFor="email">
                  Luma registration email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                <button type="submit" disabled={busy || !email.trim()} className={buttonClass}>
                  {busy ? "Sending code…" : "Email me a sign-in code"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="w-full space-y-4 text-left">
                <p className="text-sm text-[var(--text-secondary)]">
                  We sent a code to <strong className="text-white">{email.trim()}</strong>. It expires in 10 minutes.
                </p>
                <p className="text-sm text-[var(--text-muted)]">{OTP_LATEST_ONLY_HINT}</p>
                <label className="block text-sm font-medium text-[var(--text-secondary)]" htmlFor="code">
                  6-digit code
                </label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(sanitizeOtp(e.target.value))}
                  onPaste={(e) => {
                    // maxLength would cut "123 456" to "123 45" before we can strip the space.
                    e.preventDefault();
                    setCode(sanitizeOtp(e.clipboardData.getData("text")));
                  }}
                  placeholder="123456"
                  className={`${inputClass} tracking-[0.4em] text-center text-lg`}
                />
                <button type="submit" disabled={busy || code.length !== 6} className={buttonClass}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError(null);
                    }}
                    className="text-[var(--text-muted)] hover:text-white"
                  >
                    Use another email
                  </button>
                  {error ? <span /> : resendButton}
                </div>
              </form>
            )}

            <p className="mt-6 text-sm text-[var(--text-muted)]">
              Not registered yet?{" "}
              <a
                href={EVENT.registration.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline"
              >
                Register on Luma
              </a>{" "}
              first. Only guests approved on Luma can sign in; if you are on the waitlist or pending, you can sign in once
              the organisers approve you.{" "}
              <Link href="/rules" className="text-white underline">
                How teams work
              </Link>
            </p>

            <Link
              href="/"
              className="mt-8 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              ← Back to the event page
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
