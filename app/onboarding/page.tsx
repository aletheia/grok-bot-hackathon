"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, Compass, Users, Trophy, Clock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  isStaffPortalRole,
  requiresParticipantOnboarding,
} from "@/lib/auth/roles";
import { NoiseOverlay } from "@/components/ui";

type OnboardingLanguage = "en";

type StepContent = {
  icon: typeof Compass;
  title: string;
  text: string;
};

const STEPS: Record<OnboardingLanguage, StepContent[]> = {
  en: [
    {
      icon: Compass,
      title: "Welcome to Grok Hackathon",
      text: "This is a hackathon for AI product development. Complete this short onboarding to learn how the participation process works.",
    },
    {
      icon: Users,
      title: "Registration & Team Formation",
      text: "After onboarding, you'll land on your dashboard. There you can create a team, join one with its team code, or mark yourself as available to join a team. Teams have 4 to 6 people, and they lock on 31 October at 23:59 (Rome time).",
    },
    {
      icon: Clock,
      title: "Screening Round",
      text: "When the admin starts the screening, a button to the tasks will appear on your dashboard. Each team member answers logic questions, and the team adds a link to a short demo video (YouTube or Google Drive). After submitting, wait for the results.",
    },
    {
      icon: Trophy,
      title: "Results & Finals",
      text: "Screening results will be shown on your dashboard. If your team passes — welcome to the finals! You'll gain access to partner credits and the next stages of the hackathon.",
    },
  ],
};

const BUTTON_LABELS: Record<OnboardingLanguage, { next: string; finish: string; saving: string; loading: string; redirecting: string }> = {
  en: { next: "Next", finish: "Finish", saving: "Saving…", loading: "Loading…", redirecting: "Redirecting…" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lang: OnboardingLanguage = "en";

  useEffect(() => {
    if (isPending || !session?.user) return;
    const role = (session.user as { role?: string }).role ?? "participant";
    if (!requiresParticipantOnboarding(role)) {
      if (isStaffPortalRole(role)) {
        router.replace("/staff");
      } else if (role === "super_admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/register");
    }
  }, [isPending, session, router]);

  const handleComplete = async () => {
    setError(null);
    setCompleting(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to complete");
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCompleting(false);
    }
  };

  const steps = STEPS[lang];
  const labels = BUTTON_LABELS[lang];

  if (isPending || !session?.user) {
    return (
      <>
        <NoiseOverlay />
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-[var(--text-muted)]">{labels.loading}</div>
        </div>
      </>
    );
  }

  const sessionRole = (session.user as { role?: string }).role ?? "participant";
  if (!requiresParticipantOnboarding(sessionRole)) {
    return (
      <>
        <NoiseOverlay />
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-[var(--text-muted)]">{labels.redirecting}</div>
        </div>
      </>
    );
  }

  const current = steps[step];
  const Icon = current?.icon ?? Compass;
  const isLast = step === steps.length - 1;

  return (
    <>
      <NoiseOverlay />
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent-blue)]/20">
              <Icon className="h-7 w-7 text-[var(--accent-blue)]" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${lang}-${step}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold text-white text-center">
                {current?.title}
              </h1>
              <p className="mt-4 text-[var(--text-secondary)] text-center text-sm leading-relaxed">
                {current?.text}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full ${
                    i <= step ? "bg-[var(--accent-blue)]" : "bg-[var(--border-color)]"
                  }`}
                />
              ))}
            </div>
            {!isLast ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-blue)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-blue)]/90"
              >
                {labels.next}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-blue)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-blue)]/90 disabled:opacity-50"
              >
                {completing ? labels.saving : labels.finish}
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}
