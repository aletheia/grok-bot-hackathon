import { ExternalLink } from 'lucide-react';
import { EVENT } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getSponsorContactHref, getSponsorTiers, type RenderedTier } from '@/lib/landing-content';
import { AssetSlot, Section } from './shared';

const TILE: Record<RenderedTier['size'], { grid: string; tile: string; logo: { width: number; height: number } }> = {
  lg: { grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', tile: 'min-h-[8.5rem]', logo: { width: 180, height: 72 } },
  md: { grid: 'grid-cols-2 lg:grid-cols-4', tile: 'min-h-[6.5rem]', logo: { width: 128, height: 52 } },
  sm: { grid: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6', tile: 'min-h-[5rem]', logo: { width: 96, height: 40 } },
};

function Tier({ tier }: { tier: RenderedTier }) {
  const size = TILE[tier.size];
  const headingId = `sponsors-${tier.id}`;
  return (
    <div>
      <h3 id={headingId} className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {tier.title}
      </h3>
      <ul aria-labelledby={headingId} className={`mt-4 grid gap-4 ${size.grid}`}>
        {tier.items.map((sponsor, i) => {
          if (!sponsor?.name) {
            return (
              <li
                key={`${tier.id}-placeholder-${i}`}
                className={`flex items-center justify-center rounded-3xl border-2 border-dashed border-white/15 p-4 ${size.tile}`}
                data-placeholder="sponsor"
              >
                <span
                  role="img"
                  aria-label={`Logo placeholder: ${t('landing', 'sponsorPlaceholder')}`}
                  className="text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
                >
                  {t('landing', 'sponsorPlaceholder')} logo
                </span>
              </li>
            );
          }
          const logo = <AssetSlot src={sponsor.logo ?? null} kind="logo" label={sponsor.name} {...size.logo} />;
          const tileClass = `flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-4 ${size.tile}`;
          return (
            <li key={sponsor.name}>
              {sponsor.url ? (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${tileClass} min-h-[44px] w-full transition-colors hover:border-white/30`}
                  aria-label={`${sponsor.name} ${t('landing', 'opensInNewTab')}`}
                >
                  {logo}
                </a>
              ) : (
                <div className={tileClass}>{logo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sponsors() {
  const tiers = getSponsorTiers(EVENT.sponsors.tiers);
  const contactHref = getSponsorContactHref(EVENT.sponsors.contact);
  const external = contactHref !== null && !contactHref.startsWith('mailto:');

  return (
    <Section id="sponsors" tag={t('landing', 'sponsorsTag')} title={t('landing', 'sponsorsTitle')} accent="orange">
      <div className="space-y-10">
        {tiers.map((tier) => (
          <Tier key={tier.id} tier={tier} />
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="max-w-xl">
          <h3 className="font-display text-2xl font-bold text-white">{t('landing', 'becomeSponsorTitle')}</h3>
          <p className="mt-2 text-[var(--text-secondary)]">{t('landing', 'becomeSponsorText')}</p>
        </div>
        {contactHref ? (
          <a
            href={contactHref}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
          >
            {t('landing', 'becomeSponsorCta')}
            {external && (
              <>
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
              </>
            )}
          </a>
        ) : (
          // TODO(Luca): set EVENT.sponsors.contact.email or .url in lib/event.ts to enable the CTA.
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <p className="rounded-full border-2 border-dashed border-white/20 px-4 py-2 text-sm font-semibold text-white" data-placeholder="sponsor-contact">
              {t('landing', 'sponsorContactTba')}
            </p>
            <a
              href={EVENT.registration.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 font-semibold text-white hover:border-white/60"
            >
              {t('landing', 'lumaPage')}
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
            </a>
          </div>
        )}
      </div>
    </Section>
  );
}
