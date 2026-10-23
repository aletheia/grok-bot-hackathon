import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { RegistrationNotice } from "@/components/RegistrationNotice";
import { TrackDetail } from "@/components/tracks/TrackDetail";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: "Proposed tracks",
  description: `The proposed tracks for ${EVENT.name}: Research Radar, GitHub Benchmark Arena and Agent Failure Lab. Every insight must be verifiable.`,
  alternates: { canonical: "/tracks" },
};

export default function TracksPage() {
  const { items, vision, statusNote, principles, deliverables, suggestionsNote } = EVENT.tracks;
  return (
    <>
      <Navigation />
      <main id="content" className="mx-auto max-w-4xl px-4 pb-20 pt-32 sm:px-6">
        <p className="inline-flex items-center rounded-full border border-[var(--blob-teal)]/60 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--blob-teal)]">
          Proposed
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-white md:text-5xl">Proposed Tracks</h1>
        <p className="mt-5 text-xl leading-relaxed text-white">{vision}</p>
        <p className="mt-4 text-[var(--text-secondary)]">{statusNote}</p>

        <nav aria-label="Tracks" className="mt-8">
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {items.map((track) => (
              <li key={track.id}>
                <a
                  href={`#${track.id}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 font-semibold text-white hover:border-white/60"
                >
                  <span className="font-mono text-sm text-[var(--blob-teal)]">{track.number}</span>
                  {track.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <RegistrationNotice className="mt-10" />

        <div className="mt-12 space-y-8">
          {items.map((track) => (
            <TrackDetail key={track.id} track={track} />
          ))}
        </div>

        <section id="principles" aria-labelledby="principles-title" className="mt-16 scroll-mt-28">
          <h2 id="principles-title" className="font-display text-3xl font-extrabold text-white">
            Shared principles
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-[var(--text-secondary)]">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="deliverables" aria-labelledby="deliverables-title" className="mt-16 scroll-mt-28">
          <h2 id="deliverables-title" className="font-display text-3xl font-extrabold text-white">
            What to deliver
          </h2>
          <ul className="mt-6 space-y-3">
            {deliverables.items.map((item) => (
              <li key={item} className="flex gap-3 text-white">
                <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--blob-teal)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[var(--text-secondary)]">{deliverables.note}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{suggestionsNote}</p>
        </section>

        <section aria-labelledby="announce-title" className="mt-16 rounded-3xl border border-dashed border-white/25 p-6">
          <h2 id="announce-title" className="text-xl font-bold text-white">
            Judging criteria, prizes and jury
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            To be announced. We will publish them on the{" "}
            <Link href="/#prizes" className="font-semibold text-white underline underline-offset-4">
              home page
            </Link>{" "}
            and on Luma.
          </p>
        </section>

        <div className="mt-12">
          <Link
            href="/#tracks"
            className="inline-flex min-h-[44px] items-center font-semibold text-white underline underline-offset-4"
          >
            Back to the home page
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
