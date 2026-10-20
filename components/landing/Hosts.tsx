'use client';

import { EVENT } from '@/lib/event';
import { useLanguage } from '@/lib/LanguageContext';
import { Blob, type BlobVariant } from './Blob';
import { LumaCta, Section } from './shared';

const VARIANTS: BlobVariant[] = ['pink', 'orange', 'teal'];

export function Hosts() {
  const { t } = useLanguage();
  return (
    <Section id="host" tag={t('landing', 'hostsTag')} title={t('landing', 'hostsTitle')} accent="blue">
      <ul className="grid gap-4 sm:grid-cols-3">
        {EVENT.hosts.map((name, i) => (
          <li key={name} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <Blob variant={VARIANTS[i % VARIANTS.length]} size={56} float={false} className="shrink-0" />
            <span className="text-lg font-semibold text-white">{name}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[var(--text-secondary)]">
        {t('landing', 'hostedBy')} <span className="font-semibold text-white">{EVENT.organizer.name}</span>
      </p>

      <div className="relative mt-20 overflow-hidden rounded-[2rem] bg-white/[0.04] px-6 py-14 text-center md:px-12">
        <Blob variant="pink" size={64} className="absolute left-6 top-6 hidden sm:block" />
        <Blob variant="blue" size={72} delay={0.8} className="absolute bottom-6 right-6 hidden sm:block" />
        <h2 className="font-display text-3xl font-extrabold text-white md:text-5xl">{t('landing', 'finalTitle')}</h2>
        <div className="mt-8 flex justify-center">
          <LumaCta />
        </div>
      </div>
    </Section>
  );
}
