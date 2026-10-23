import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { EVENT, type Sponsor } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getSponsorContactHref, getSponsorTiers, type RenderedTier } from '@/lib/landing-content';
import { Section } from './shared';

/**
 * Logos are often white artwork on transparent PNGs, so every named sponsor sits on the same
 * dark tile (--bg-tertiary) with a fixed-height logo box: wide and near-square logos get the
 * same visual weight (max height 72px, max width of the tile minus padding) and stay readable
 * whatever the section background is.
 */
const TILE: Record<RenderedTier['size'], { grid: string; tile: string; logo: string }> = {
  lg: { grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', tile: 'h-36', logo: 'max-h-16 max-w-[13rem]' },
  md: { grid: 'grid-cols-2 lg:grid-cols-3', tile: 'h-28 sm:h-32', logo: 'max-h-14 max-w-full sm:max-h-[4.5rem] sm:max-w-[12rem]' },
  sm: { grid: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6', tile: 'h-24', logo: 'max-h-10 max-w-full' },
};

function SponsorLogo({ sponsor, className }: { sponsor: Sponsor & { name: string }; className: string }) {
  if (!sponsor.logo) {
    // Named but no logo file yet: labelled placeholder, same as before the logo is supplied.
    return (
      <span
        role="img"
        aria-label={`Logo placeholder: ${sponsor.name}`}
        data-placeholder="logo"
        className="flex h-14 w-40 max-w-full items-center justify-center rounded-xl border-2 border-dashed border-white/25 bg-white/[0.03] p-1 text-center text-[11px] font-semibold uppercase leading-tight tracking-wide text-[var(--text-secondary)]"
      >
        {sponsor.name} logo
      </span>
    );
  }
  return (
    <Image
      src={sponsor.logo}
      alt={sponsor.logoAlt ?? `${sponsor.name} logo`}
      width={sponsor.logoWidth ?? 400}
      height={sponsor.logoHeight ?? 160}
      unoptimized
      className={`h-auto w-auto object-contain ${className}`}
    />
  );
}

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
          const named = sponsor as Sponsor & { name: string };
          const logo = <SponsorLogo sponsor={named} className={size.logo} />;
          const tileClass = `flex items-center justify-center rounded-3xl border border-white/10 bg-[var(--bg-tertiary)] px-5 py-4 ${size.tile}`;
          return (
            <li key={sponsor.name} className="min-w-0">
              {sponsor.url ? (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${tileClass} w-full transition-colors hover:border-white/40`}
                  aria-label={`${sponsor.name} ${t('landing', 'opensInNewTab')}`}
                >
                  {logo}
                </a>
              ) : (
                <div className={`${tileClass} w-full`}>{logo}</div>
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
