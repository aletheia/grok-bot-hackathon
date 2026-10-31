import { EVENT, type Criterion, type JuryMember } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getJurySlots } from '@/lib/landing-content';
import { Announcement, Card, Section } from './shared';
import { JurorCard, JurorPlaceholder } from './JurorCard';

const JURY: readonly JuryMember[] = EVENT.jury;
const CRITERIA: readonly Criterion[] = EVENT.criteria;

export function Jury() {
  const slots = getJurySlots(JURY, EVENT.juryPlaceholderSlots);
  return (
    <Section id="jury" tag={t('landing', 'juryTag')} title={t('landing', 'juryTitle')} accent="teal">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {slots.map((juror, i) => (juror?.name ? <JurorCard key={juror.name} juror={juror as JuryMember & { name: string }} /> : <JurorPlaceholder key={`juror-${i}`} />))}
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
