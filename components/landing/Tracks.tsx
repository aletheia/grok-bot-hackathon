import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EVENT } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Section } from './shared';

/** Homepage recap of the proposed tracks: three cards linking to the full brief on /tracks. */
export function Tracks() {
  const { items, vision, statusNote } = EVENT.tracks;
  return (
    <Section id="tracks" tag={t('landing', 'tracksTag')} title={t('landing', 'tracksTitle')} accent="teal">
      <div className="max-w-3xl">
        {EVENT.tracks.status === 'proposed' && (
          <p className="mb-5 inline-flex items-center rounded-full border border-[var(--blob-teal)]/60 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--blob-teal)]">
            {t('landing', 'tracksProposed')}
          </p>
        )}
        <p className="text-xl leading-relaxed text-white md:text-2xl">{vision}</p>
        <p className="mt-4 text-[var(--text-secondary)]">{statusNote}</p>
      </div>

      <ul className="mt-10 grid gap-4 lg:grid-cols-3">
        {items.map((track) => (
          <li key={track.id}>
            <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <p className="font-mono text-sm font-bold text-[var(--blob-teal)]">{track.number}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{track.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{track.subtitle}</p>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {t('landing', 'trackQuestion')}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold leading-snug text-white">{track.guidingQuestion}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {t('landing', 'trackResult')}
                  </dt>
                  <dd className="mt-1 text-white">{track.mainResult}</dd>
                </div>
              </dl>
              <Link
                href={`/tracks#${track.id}`}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-semibold text-[var(--blob-teal)] underline-offset-4 hover:underline"
              >
                {t('landing', 'tracksViewBrief')}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">for {track.title}</span>
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Link
          href="/tracks"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-6 font-bold text-black hover:bg-white/90"
        >
          {t('landing', 'tracksViewBrief')}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <p className="text-sm text-[var(--text-secondary)]">
          {EVENT.tracks.principles.map((p) => p.title).join(' · ')}
        </p>
      </div>
    </Section>
  );
}
