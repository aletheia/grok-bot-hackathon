'use client';

import { EVENT } from '@/lib/event';
import { useLanguage } from '@/lib/LanguageContext';
import { Section, useL } from './shared';

export function AfterEvent() {
  const { t } = useLanguage();
  const l = useL();
  const { followUp } = EVENT;
  return (
    <Section id="startup-weekend" tag={t('landing', 'afterTag')} title={followUp.name} accent="teal">
      <p className="max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">{l(followUp.text)}</p>
    </Section>
  );
}
