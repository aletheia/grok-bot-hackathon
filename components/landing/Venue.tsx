import { ExternalLink, MapPin, Moon, Train } from 'lucide-react';
import { EVENT, formatAddress, getMapsUrl } from '@/lib/event';
import { t } from '@/lib/i18n';
import { AssetSlot, Card, Section } from './shared';

export function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 font-semibold text-white hover:border-white/60"
    >
      {children}
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
    </a>
  );
}

export function Venue() {
  const { venue, assets } = EVENT;
  return (
    <Section id="venue" tag={t('landing', 'venueTag')} title={t('landing', 'venueTitle')} accent="pink">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="flex items-center gap-4">
            <AssetSlot src={assets.logos.ctrlAltMuseum} kind="logo" label={venue.name} width={96} height={64} />
            <AssetSlot src={assets.logos.compvter} kind="logo" label={venue.operator} width={96} height={64} />
          </div>
          <h3 className="mt-6 font-display text-3xl font-bold text-white">{venue.name}</h3>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">{venue.description}</p>
          <address className="mt-6 flex items-start gap-3 not-italic text-lg text-white">
            <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--blob-pink)]" />
            {formatAddress()}
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            <ExtLink href={getMapsUrl()}>{t('landing', 'openMaps')}</ExtLink>
            <ExtLink href={venue.url}>{t('landing', 'museumSite')}</ExtLink>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--blob-teal)]">{t('landing', 'gettingThere')}</h3>
          <ul className="mt-4 space-y-4">
            {venue.gettingThere.map((line) => (
              <li key={line} className="flex items-start gap-3 text-lg text-white">
                <Train aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--blob-teal)]" />
                {line}
              </li>
            ))}
            {venue.openOvernight && (
              <li className="flex items-start gap-3 text-lg text-white">
                <Moon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--blob-teal)]" />
                {t('landing', 'overnightNote')}
              </li>
            )}
          </ul>
        </Card>
      </div>
    </Section>
  );
}
