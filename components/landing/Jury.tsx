import { EVENT, type JuryMember } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getJurySlots } from '@/lib/landing-content';
import { Section } from './shared';
import { JurorCard, JurorPlaceholder } from './JurorCard';

const JURY: readonly JuryMember[] = EVENT.jury;

export function Jury() {
  const slots = getJurySlots(JURY, EVENT.juryPlaceholderSlots);
  return (
    <Section id="jury" tag={t('landing', 'juryTag')} title={t('landing', 'juryTitle')} accent="teal">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {slots.map((juror, i) => (juror?.name ? <JurorCard key={juror.name} juror={juror as JuryMember & { name: string }} /> : <JurorPlaceholder key={`juror-${i}`} />))}
      </ul>
    </Section>
  );
}
