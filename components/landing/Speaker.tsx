'use client';

import { EVENT } from '@/lib/event';
import { useLanguage } from '@/lib/LanguageContext';
import { Blob } from './Blob';
import { Card, Section, useL } from './shared';

export function Speaker() {
  const { t } = useLanguage();
  const l = useL();
  const { speaker } = EVENT;
  return (
    <Section id="speaker" tag={t('landing', 'speakerTag')} title={t('landing', 'speakerTitle')} accent="blue">
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Blob variant="blue" size={96} float={false} className="shrink-0" />
        <div>
          <h3 className="font-display text-3xl font-bold text-white">{speaker.name}</h3>
          <p className="mt-1 font-semibold text-[var(--blob-blue-text)]">{l(speaker.role)}</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{l(speaker.bio)}</p>
        </div>
      </Card>
    </Section>
  );
}
