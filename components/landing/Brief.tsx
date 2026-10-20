import { EVENT, type Track } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Announcement, Card, Section } from './shared';

const TRACKS: readonly Track[] = EVENT.tracks;

export function Brief() {
  return (
    <Section id="brief" tag={t('landing', 'briefTag')} title={t('landing', 'briefTitle')} accent="pink">
      <p className="max-w-3xl text-xl leading-relaxed text-white md:text-2xl">{EVENT.brief}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[var(--text-secondary)]">{t('landing', 'briefWith')}</span>
        {EVENT.grokSurfaces.map((s) => (
          <span key={s} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-12">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--blob-pink)]">{t('landing', 'tracksTag')}</p>
        {TRACKS.length === 0 ? (
          <Announcement title={t('landing', 'tracksTitle')} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((track) => (
              <li key={track.title}>
                <Card className="h-full">
                  <h3 className="font-display text-xl font-bold text-white">{track.title}</h3>
                  {track.description && <p className="mt-2 text-[var(--text-secondary)]">{track.description}</p>}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
