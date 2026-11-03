import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { RegistrationNotice } from "@/components/RegistrationNotice";
import { TbcTag } from "@/components/tracks/TbcText";
import { TrackDetail } from "@/components/tracks/TrackDetail";
import { EVENT } from "@/lib/event";
import type { TrackContent } from "@/lib/tracks";

export const metadata: Metadata = {
  title: "Proposed tracks",
  description: `The ten proposed tracks for ${EVENT.name}: four proposed by companies (SEA Vision, Riso Scotti, Cristina Portinaro Cosmetics, Riello) and six open tracks proposed by the organisers.`,
  alternates: { canonical: "/tracks" },
};

const GROUPS: { kind: TrackContent["kind"]; id: string; title: string }[] = [
  { kind: "company", id: "company-tracks", title: "Tracks proposed by companies" },
  { kind: "open", id: "open-tracks", title: "Open tracks" },
];

export default function TracksPage() {
  const { items, vision, statusNote, tbcNote, rules } = EVENT.tracks;
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
        <p className="mt-2 text-[var(--text-secondary)]">
          <TbcTag /> {tbcNote}
        </p>

        <nav aria-label="Tracks" className="mt-8 space-y-4">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{group.title}</p>
              <ul className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {items
                  .filter((track) => track.kind === group.kind)
                  .map((track) => (
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
            </div>
          ))}
          <p>
            <a href="#rules" className="font-semibold text-white underline underline-offset-4">
              Rules for all tracks
            </a>
          </p>
        </nav>

        <RegistrationNotice className="mt-10" />

        {GROUPS.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="mt-12 scroll-mt-28">
            <h2 id={`${group.id}-title`} className="font-display text-3xl font-extrabold text-white">
              {group.title}
            </h2>
            <div className="mt-6 space-y-8">
              {items
                .filter((track) => track.kind === group.kind)
                .map((track) => (
                  <TrackDetail key={track.id} track={track} />
                ))}
            </div>
          </section>
        ))}

        <section id="rules" aria-labelledby="rules-title" className="mt-16 scroll-mt-28">
          <h2 id="rules-title" className="font-display text-3xl font-extrabold text-white">
            Rules for all tracks
          </h2>
          <ul className="mt-6 space-y-3">
            {rules.map((rule) => (
              <li key={rule} className="flex gap-3 text-white">
                <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--blob-teal)]" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="jury-title" className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 id="jury-title" className="text-xl font-bold text-white">
            Jury
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            <Link href="/#jury" className="font-semibold text-white underline underline-offset-4">
              Meet the jury on the home page
            </Link>
            .
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
