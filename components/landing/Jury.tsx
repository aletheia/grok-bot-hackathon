import { ExternalLink } from 'lucide-react';
import { EVENT, type Criterion, type JuryMember } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getJurySlots } from '@/lib/landing-content';
import { Announcement, AssetSlot, Card, Section } from './shared';

const JURY: readonly JuryMember[] = EVENT.jury;
const CRITERIA: readonly Criterion[] = EVENT.criteria;

function JurorPlaceholder() {
  return (
    <li className="flex flex-col items-start rounded-3xl border-2 border-dashed border-white/15 p-6" data-placeholder="juror">
      <AssetSlot src={null} kind="photo" label={t('landing', 'jurorName')} width={88} height={88} />
      <h3 className="mt-4 text-lg font-bold text-white">
        {t('landing', 'jurorName')}
        <span className="sr-only"> ({t('landing', 'tba')})</span>
      </h3>
      <p className="text-sm text-[var(--text-secondary)]">{t('landing', 'jurorRole')}</p>
      <p className="mt-3 text-[var(--text-secondary)]">{t('landing', 'jurorBio')}</p>
    </li>
  );
}

function Juror({ juror }: { juror: JuryMember & { name: string } }) {
  const roleLine = [juror.role, juror.org].filter(Boolean).join(' · ');
  return (
    <li className="flex flex-col items-start rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <AssetSlot src={juror.photo ?? null} kind="photo" label={juror.name} width={88} height={88} />
      <h3 className="mt-4 text-lg font-bold text-white">{juror.name}</h3>
      {roleLine && <p className="text-sm text-[var(--text-secondary)]">{roleLine}</p>}
      {juror.bio && <p className="mt-3 text-[var(--text-secondary)]">{juror.bio}</p>}
      {juror.link && (
        <a
          href={juror.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 font-semibold text-white underline-offset-4 hover:underline"
        >
          {t('landing', 'jurorLink')}
          <span className="sr-only">
            {' '}
            {juror.name} {t('landing', 'opensInNewTab')}
          </span>
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      )}
    </li>
  );
}

export function Jury() {
  const slots = getJurySlots(JURY, EVENT.juryPlaceholderSlots);
  return (
    <Section id="jury" tag={t('landing', 'juryTag')} title={t('landing', 'juryTitle')} accent="teal">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((juror, i) => (juror?.name ? <Juror key={juror.name} juror={juror as JuryMember & { name: string }} /> : <JurorPlaceholder key={`juror-${i}`} />))}
      </ul>

      <div className="mt-6">
        {CRITERIA.length === 0 ? (
          <Announcement title={t('landing', 'criteriaTitle')} />
        ) : (
          <Card>
            <h3 className="font-display text-xl font-bold text-white">{t('landing', 'criteriaTitle')}</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {CRITERIA.map((c) => (
                <li key={c.title}>
                  <p className="font-semibold text-white">
                    {c.title}
                    {c.weight && <span className="ml-2 text-sm text-[var(--blob-teal)]">{c.weight}</span>}
                  </p>
                  {c.description && <p className="text-[var(--text-secondary)]">{c.description}</p>}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Section>
  );
}
