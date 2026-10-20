'use client';

import { EVENT } from '@/lib/event';
import { useLanguage } from '@/lib/LanguageContext';
import { Section, useL } from './shared';

export function Brief() {
  const { t } = useLanguage();
  const l = useL();
  return (
    <Section id="sfida" tag={t('landing', 'briefTag')} title={t('landing', 'briefTitle')} accent="pink">
      <p className="max-w-3xl text-xl leading-relaxed text-white md:text-2xl">{l(EVENT.brief)}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[var(--text-secondary)]">{t('landing', 'briefWith')}</span>
        {EVENT.grokSurfaces.map((s) => (
          <span key={s} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
            {s}
          </span>
        ))}
      </div>
    </Section>
  );
}
