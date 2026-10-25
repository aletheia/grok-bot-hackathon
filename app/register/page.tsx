"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  OTP_LATEST_ONLY_HINT,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_SEND_FAILED_MESSAGE,
  authErrorText,
  sanitizeOtp,
} from "@/lib/auth/otp-messages";
import {
  COPY,
  classifyVerifyError,
  codeErrorText,
  formatCountdown,
  guestListNotice,
  isPlausibleEmail,
  type GuestListNotice,
} from "@/lib/auth/register-flow";
import { EVENT } from "@/lib/event";
import { Logo, NoiseOverlay } from "@/components/ui";
import { EventSummaryCard } from "@/components/register/EventSummaryCard";
import { InlineNotice, LumaLink } from "@/components/register/InlineNotice";
import { OtpInput } from "@/components/register/OtpInput";
import { StepIndicator } from "@/components/register/StepIndicator";
import { useCooldown } from "@/components/register/useCooldown";

const LOADING_UI = (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
    <div className="text-[var(--text-muted)]">Loading...</div>
  </div>
);

type Step = "email" | "code";
type EmailAlert = null | { kind: "invalid-email" } | { kind: "guest"; notice: GuestListNotice } | { kind: "error"; text: string };
type CodeAlert = null | { kind: "invalid" | "expired" | "locked" | "short" } | { kind: "other"; text: string };
type Focus = "email" | "email-select" | "code" | "code-select" | "success";

const NETWORK_ERROR = "Cannot reach the sign-in service. Please try again.";
const REDIRECT_DELAY_MS = 1500;

const primaryButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--blob-orange)] px-6 text-base font-bold text-[#0a0a0a] transition hover:brightness-110 aria-disabled:cursor-wait aria-disabled:brightness-90";
const outlineButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--border-input)] px-6 text-base font-bold text-white transition hover:bg-white/5 aria-disabled:cursor-not-allowed aria-disabled:text-[var(--text-secondary)] aria-disabled:hover:bg-transparent";

function Spinner() {
  return <Loader2 aria-hidden="true" className="size-5 motion-safe:animate-spin" />;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState<Step>("email");
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<null | "send" | "verify">(null);
  const [emailAlert, setEmailAlert] = useState<EmailAlert>(null);
  const [codeAlert, setCodeAlert] = useState<CodeAlert>(null);
  const [sentNotice, setSentNotice] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [focusReq, setFocusReq] = useState<{ target: Focus; n: number } | null>(null);
  const cooldown = useCooldown();

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const wasCooling = useRef(false);

  const requestFocus = (target: Focus) => setFocusReq((prev) => ({ target, n: (prev?.n ?? 0) + 1 }));

  // Focus moves after the panel it targets has rendered.
  useEffect(() => {
    if (!focusReq) return;
    const { target } = focusReq;
    const el = target.startsWith("email") ? emailRef.current : target.startsWith("code") ? codeRef.current : successRef.current;
    el?.focus();
    if (target.endsWith("-select") && el instanceof HTMLInputElement) el.select();
  }, [focusReq]);

  // Polite, rare announcements for the cooldown (the visible countdown itself is aria-live="off").
  useEffect(() => {
    if (wasCooling.current && cooldown.remaining === 0) setAnnounce("You can request a new code now.");
    wasCooling.current = cooldown.remaining > 0;
  }, [cooldown.remaining]);

  useEffect(() => {
    if (!isPending && session?.user && !done) {
      router.replace("/dashboard");
    }
  }, [isPending, router, session, done]);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => router.replace("/dashboard"), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [done, router]);

  const showGuestNotice = (notice: GuestListNotice) => {
    setStep("email");
    setCode("");
    setCodeAlert(null);
    setSentNotice(false);
    cooldown.reset();
    setEmailAlert({ kind: "guest", notice });
    requestFocus("email-select");
  };

  /** `resend` is true when called from the code step: failures other than the guest list stay on that step. */
  const sendCode = async (resend: boolean) => {
    setEmailAlert(null);
    setCodeAlert(null);
    setSentNotice(false);
    setBusy("send");
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });
      if (sendError) {
        const notice = guestListNotice(sendError as { status?: number; code?: string; message?: string });
        if (notice) {
          showGuestNotice(notice);
          return;
        }
        const text = authErrorText(sendError, OTP_SEND_FAILED_MESSAGE);
        if (resend) setCodeAlert({ kind: "other", text });
        else {
          setEmailAlert({ kind: "error", text });
          requestFocus("email");
        }
        return;
      }
      setCode("");
      cooldown.start(OTP_RESEND_COOLDOWN_SECONDS);
      setAnnounce(`Code sent. You can request another in ${OTP_RESEND_COOLDOWN_SECONDS} seconds.`);
      if (resend) setSentNotice(true);
      setStep("code");
      requestFocus("code");
    } catch {
      if (resend) setCodeAlert({ kind: "other", text: NETWORK_ERROR });
      else setEmailAlert({ kind: "error", text: NETWORK_ERROR });
    } finally {
      setBusy(null);
    }
  };

  const submitEmail = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!isPlausibleEmail(email)) {
      setEmailAlert({ kind: "invalid-email" });
      requestFocus("email");
      return;
    }
    void sendCode(false);
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (code.length !== 6) {
      setCodeAlert({ kind: "short" });
      requestFocus("code");
      return;
    }
    setCodeAlert(null);
    setSentNotice(false);
    setBusy("verify");
    try {
      const { error: signInError } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp: sanitizeOtp(code),
      });
      if (signInError) {
        const outcome = classifyVerifyError(
          signInError as { status?: number; code?: string; message?: string },
          "That code did not work. Check it or request a new one.",
        );
        if (outcome.kind === "guest") {
          showGuestNotice(outcome.notice);
        } else if (outcome.kind === "other") {
          setCodeAlert(outcome);
        } else {
          // The typed code is kept after a failure so it can be corrected, not retyped.
          setCodeAlert({ kind: outcome.kind });
          if (outcome.kind === "invalid") requestFocus("code-select");
        }
        return;
      }
      setDone(true);
      requestFocus("success");
    } catch {
      setCodeAlert({ kind: "other", text: NETWORK_ERROR });
    } finally {
      setBusy(null);
    }
  };

  const changeEmail = () => {
    setStep("email");
    setCode("");
    setCodeAlert(null);
    setSentNotice(false);
    setEmailAlert(null);
    cooldown.reset();
    requestFocus("email-select");
  };

  if ((isPending || session?.user) && !done) {
    return (
      <>
        <NoiseOverlay />
        {LOADING_UI}
      </>
    );
  }

  const currentStep = done ? 4 : step === "email" ? 1 : 2;
  const sendingEmail = busy === "send" && step === "email";
  const dead = codeAlert?.kind === "expired" || codeAlert?.kind === "locked";
  const cooling = cooldown.remaining > 0;
  const resending = busy === "send" && step === "code";
  const verifying = busy === "verify";
  const resendOnTop = !!codeAlert || sentNotice;
  const codeInvalid = !!codeAlert && codeAlert.kind !== "other";
  const emailInvalid = emailAlert?.kind === "invalid-email";

  const renderEmailAlert = () => {
    if (!emailAlert) return null;
    if (emailAlert.kind === "invalid-email") {
      return <InlineNotice tone="error"><p>{COPY.emailInvalid}</p></InlineNotice>;
    }
    if (emailAlert.kind === "error") {
      return <InlineNotice tone="error"><p>{emailAlert.text}</p></InlineNotice>;
    }
    const c = COPY[emailAlert.notice];
    return (
      <InlineNotice tone="info">
        <p className="font-semibold">{c.title}</p>
        <p className="mt-1 text-[var(--text-secondary)]">{c.body}</p>
        <LumaLink href={EVENT.registration.url} className="mt-1">{c.link}</LumaLink>
      </InlineNotice>
    );
  };

  const renderCodeAlert = () => {
    if (!codeAlert) return null;
    return (
      <InlineNotice tone="error">
        <p>{codeAlert.kind === "other" ? codeAlert.text : codeErrorText(codeAlert.kind)}</p>
      </InlineNotice>
    );
  };

  return (
    <>
      <NoiseOverlay />
      {/* Geist applies to /register only: the body font (globals.css) is deliberately left as on main. */}
      <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
        <div className="mx-auto w-full max-w-[1080px] px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:pt-8">
          <header className="mb-4 flex items-center justify-between sm:mb-6">
            <Link
              href="/"
              aria-label={`${EVENT.shortName}, back to the event page`}
              className="-ml-2 flex min-h-11 items-center gap-3 rounded-full px-2"
            >
              <Logo size={32} />
              <span className="font-display text-[13px] font-extrabold uppercase leading-none tracking-wide">
                Grok
                <br />
                Hackathon
              </span>
            </Link>
            <Link
              href="/"
              className="-mr-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-[var(--text-secondary)] hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="size-4" /> Event page
            </Link>
          </header>

          <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
            <EventSummaryCard />

            <main id="main" className="min-w-0">
              <StepIndicator current={currentStep} />

              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 sm:p-8 lg:p-10">
                {/* STEP 1: EMAIL */}
                {step === "email" && !done ? (
                  <section aria-labelledby="h-email">
                    <h1 id="h-email" className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                      Let’s get you in.
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
                      Use the email you registered with on Luma. We’ll send you a 6-digit code. No password needed.
                    </p>

                    <form onSubmit={submitEmail} noValidate className="mt-6 flex flex-col gap-4">
                      <div id="email-alert" role="alert" className="empty:hidden">
                        {renderEmailAlert()}
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-white">
                          Email you used on Luma
                        </label>
                        <input
                          ref={emailRef}
                          id="email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="you@example.com"
                          value={email}
                          readOnly={sendingEmail}
                          aria-invalid={emailInvalid}
                          aria-describedby="email-alert"
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailInvalid) setEmailAlert(null);
                          }}
                          className="block h-12 w-full rounded-xl border-2 border-[var(--border-input)] bg-black/40 px-4 text-base text-white placeholder:text-[var(--text-muted)] read-only:opacity-70 aria-[invalid=true]:border-[var(--danger)]"
                        />
                      </div>
                      <button
                        type="submit"
                        aria-disabled={sendingEmail}
                        aria-busy={sendingEmail}
                        className={primaryButton}
                      >
                        {sendingEmail ? (
                          <>
                            <Spinner />
                            Sending your code…
                          </>
                        ) : (
                          "Email me a code"
                        )}
                      </button>
                    </form>

                    {emailAlert?.kind === "guest" ? null : (
                      <p className="mt-5 text-sm text-[var(--text-secondary)]">
                        Not on the list yet?{" "}
                        <LumaLink href={EVENT.registration.url}>Request an invitation on Luma</LumaLink>
                      </p>
                    )}
                  </section>
                ) : null}

                {/* STEP 2: CODE */}
                {step === "code" && !done ? (
                  <section aria-labelledby="h-code">
                    <h1 id="h-code" className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                      Check your email.
                    </h1>
                    <p className="mt-3 text-base text-[var(--text-secondary)]">We sent a 6-digit code to</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="flex min-w-0 items-center gap-2 font-semibold text-white">
                        <Mail aria-hidden="true" className="size-4 shrink-0 text-[var(--text-muted)]" />
                        <span className="break-all">{email.trim()}</span>
                      </p>
                      <button
                        type="button"
                        onClick={changeEmail}
                        className="inline-flex min-h-11 items-center text-sm font-semibold text-white underline underline-offset-4"
                      >
                        Change email<span className="sr-only">, go back to step 1</span>
                      </button>
                    </div>

                    <form onSubmit={verifyCode} noValidate className="mt-5 flex flex-col">
                      <label htmlFor="code" className="text-sm font-semibold text-white">
                        6-digit code
                      </label>
                      <p id="code-hint" className="mb-3 mt-1 text-sm text-[var(--text-secondary)]">
                        {OTP_LATEST_ONLY_HINT} The code expires in 10 minutes.
                      </p>

                      <OtpInput
                        id="code"
                        value={code}
                        onChange={(next) => {
                          setCode(next);
                          if (codeAlert && (codeAlert.kind === "short" || codeAlert.kind === "invalid")) setCodeAlert(null);
                        }}
                        inputRef={codeRef}
                        readOnly={verifying}
                        dead={dead}
                        invalid={codeInvalid}
                        describedBy="code-hint code-alert"
                      />

                      <div id="code-alert" role="alert" className="order-1 mt-3 empty:hidden">
                        {renderCodeAlert()}
                      </div>
                      <div role="status" className="order-1 mt-3 empty:hidden">
                        {sentNotice && !codeAlert ? (
                          <InlineNotice tone="ok">
                            <p className="font-semibold">New code sent.</p>
                            <p className="mt-0.5 text-[var(--text-secondary)]">The previous code no longer works.</p>
                          </InlineNotice>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        aria-disabled={cooling || busy === "send"}
                        onClick={() => {
                          if (cooling || busy) return;
                          void sendCode(true);
                        }}
                        className={`${dead ? primaryButton : outlineButton} ${resendOnTop ? "order-2" : "order-4"} mt-3`}
                      >
                        {resending ? (
                          <>
                            <Spinner />
                            Sending…
                          </>
                        ) : cooling ? (
                          <span>
                            Send a new code in{" "}
                            <span className="tabular-nums" aria-live="off">
                              {formatCountdown(cooldown.remaining)}
                            </span>
                          </span>
                        ) : (
                          "Send a new code"
                        )}
                      </button>

                      {!dead ? (
                        <button
                          type="submit"
                          aria-disabled={verifying}
                          aria-busy={verifying}
                          className={`${primaryButton} order-3 mt-3`}
                        >
                          {verifying ? (
                            <>
                              <Spinner />
                              Signing you in…
                            </>
                          ) : (
                            "Sign in"
                          )}
                        </button>
                      ) : null}
                    </form>
                  </section>
                ) : null}

                {/* STEP 3: SUCCESS */}
                {done ? (
                  <section aria-labelledby="h-success">
                    <div className="mb-5 flex items-center gap-4">
                      <svg viewBox="0 0 100 100" className="size-16 shrink-0" aria-hidden="true">
                        <rect x="8" y="12" width="84" height="76" rx="30" fill="#17b8a6" />
                        <rect x="33" y="38" width="10" height="20" rx="4" fill="#0a0a0a" />
                        <rect x="57" y="38" width="10" height="20" rx="4" fill="#0a0a0a" />
                      </svg>
                    </div>
                    <h1
                      id="h-success"
                      ref={successRef}
                      tabIndex={-1}
                      className="font-display text-2xl font-bold leading-tight text-white focus:outline-none sm:text-3xl"
                    >
                      You’re in.
                    </h1>
                    <p role="status" className="mt-3 text-base text-[var(--text-secondary)]">
                      Signed in as <strong className="break-all font-semibold text-white">{email.trim()}</strong>. Taking
                      you to your dashboard…
                    </p>
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-white">Once you’re there you can</p>
                      <ul className="mt-3 space-y-2 text-[15px] text-[var(--text-secondary)]">
                        {[
                          ["Register a team", " and get its code"],
                          ["Join a team", " with a code from a teammate"],
                          ["Or register as ", "looking for a team"],
                        ].map(([a, b], i) => (
                          <li key={i} className="flex gap-3">
                            <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-[var(--accent-green)]" strokeWidth={3} />
                            <span>
                              {i === 2 ? (
                                <>
                                  {a}
                                  <strong className="font-semibold text-white">{b}</strong>
                                </>
                              ) : (
                                <>
                                  <strong className="font-semibold text-white">{a}</strong>
                                  {b}
                                </>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href="/dashboard" className={`${primaryButton} mt-6`}>
                      Go to my dashboard
                    </Link>
                  </section>
                ) : null}

                {/* Polite, NON-ticking cooldown announcements */}
                <p className="sr-only" role="status">
                  {announce}
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
