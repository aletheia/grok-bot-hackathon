import { Check } from 'lucide-react';
import { EVENT } from '@/lib/event';
import { t } from '@/lib/i18n';
import { LumaCta, Section } from './shared';

export function Practical() {
  return (
    <Section id="info" tag={t('landing', 'infoTag')} title={t('landing', 'infoTitle')} accent="orange">
      <ul className="grid gap-3 sm:grid-cols-2">
        {EVENT.practical.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-lg text-white">
            <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[var(--blob-teal)]" />
            {item}
          </li>
        ))}
      </ul>
      {EVENT.registration.status === 'waitlist' && (
        <p className="mt-6 text-[var(--text-secondary)]">{t('landing', 'statusWaitlist')}</p>
      )}
      <div className="mt-6">
        <LumaCta size="md" />
      </div>
    </Section>
  );
}
