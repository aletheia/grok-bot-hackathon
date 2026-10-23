import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { RegistrationNotice } from "@/components/RegistrationNotice";
import { Navigation } from "@/components/Navigation";
import { EVENT } from "@/lib/event";
import { formatRegistrationDay, REGISTRATION_CLOSES_AT, REGISTRATION_OPENS_AT } from "@/lib/registration";
import { formatTeamLock, getTeamPaths, getTeamRules } from "@/lib/teams/rules";

export const metadata: Metadata = {
  title: "How teams work",
  description: `Sign-in, team size, secret codes, the team lock and how seats are allocated at ${EVENT.name}.`,
  alternates: { canonical: "/rules" },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "When can I register, and as what?",
    a: `Registration opens on ${formatRegistrationDay(REGISTRATION_OPENS_AT)} and runs until ${formatRegistrationDay(REGISTRATION_CLOSES_AT)} (${formatTeamLock()}). That is also the team lock: one deadline for registering and for changing teams. You can register a team (you get a secret code to share), join a team with a code, or register as an individual looking for a team. Registering a team gives priority for participation confirmation.`,
  },
  {
    q: "Which email do I sign in with?",
    a: `The one you used to register on ${EVENT.registration.provider}. We email a 6-digit code to it; there is no password. Only approved guests can sign in: if you are on the waitlist or still pending, you can sign in once the organisers approve your registration on Luma. If the portal says your email is not on the guest list, register on Luma first or try the other address you may have used. The guest list is imported from Luma by the organisers, so a new registration or approval can take a while to show up.`,
  },
  {
    q: "How do I get people into my team?",
    a: "Create the team, then share its secret code privately. Anyone with the code can join while the team has room. The team lead can generate a new code at any time; the old one stops working.",
  },
  {
    q: "I have a code but it doesn't work. Why?",
    a: "The portal tells you which case it is: the code is mistyped or unknown, the team lead has replaced it with a new one, the team is full (6 members), or the lock has passed. Codes have 8 letters and digits, never 0, 1, I or O; case, spaces and dashes don't matter. Ask your team for the current code.",
  },
  {
    q: "I don't have a team. What now?",
    a: "Register as looking for a team on your dashboard and write a short note with what you like to work on and how to reach you. Members of teams with free seats can see your name, profile and note — never your email.",
  },
  {
    q: "What happens at the lock?",
    a: `On ${formatTeamLock()} the teams are frozen. Teams with ${EVENT.portal.team.minMembers} or more members are formed and all their members get guaranteed seats. The remaining seats (out of ${EVENT.registration.capacity}) go first-come, first-served by Luma registration time to everyone else on the guest list, including people in smaller teams and people without a team.`,
  },
  {
    q: "Will I get an email about my seat?",
    a: "Not automatically from the portal. The organisers will confirm seats; check Luma and your inbox.",
  },
];

export default function RulesPage() {
  const rules = getTeamRules();
  const paths = getTeamPaths();
  return (
    <>
      <Navigation />
      <main id="content" className="mx-auto max-w-4xl px-4 pb-20 pt-32 sm:px-6">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--blob-orange)]">Rules</p>
        <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">How teams work</h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          {EVENT.name} is built in teams of {EVENT.portal.team.minMembers} to {EVENT.portal.team.maxMembers}. Here is
          everything about signing in, registering or joining a team and getting a seat.
        </p>

        <RegistrationNotice className="mt-8" showRulesLink={false} />

        <h2 className="mt-10 text-2xl font-bold text-white">Three ways to take part</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {paths.map((path, i) => (
            <li key={path.title} className="rounded-3xl border border-[var(--blob-orange)]/40 bg-[var(--blob-orange)]/[0.07] p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--blob-orange)] font-mono text-sm font-bold text-black">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold text-white">{path.title}</h3>
              <p className="mt-2 text-[var(--text-secondary)]">{path.body}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-2xl font-bold text-white">The rules</h2>
        <ol className="mt-4 space-y-4">
          {rules.map((rule, i) => (
            <li key={rule.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <span className="font-mono text-sm font-bold text-[var(--blob-orange)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 text-xl font-bold text-white">{rule.title}</h2>
              <p className="mt-2 text-[var(--text-secondary)]">{rule.body}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-14 text-2xl font-bold text-white">Questions</h2>
        <dl className="mt-6 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-white">{item.q}</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex min-h-[44px] items-center rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
          >
            Sign in with your Luma email
          </Link>
          <a
            href={EVENT.registration.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/25 px-5 font-semibold text-white hover:border-white/60"
          >
            Register on Luma
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
