import { ExternalLink } from 'lucide-react';
import { EVENT, type GrokStackItem } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Section } from './shared';

const CARD =
  'flex h-full flex-col gap-2 rounded-3xl border border-white/10 bg-[var(--bg-tertiary)] p-5 transition-colors';

function StackCard({ item }: { item: GrokStackItem }) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-2 font-display text-lg font-bold text-white">
        {item.name}
        {item.url && <ExternalLink aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />}
      </span>
      <span className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.description}</span>
      {item.url && <span className="sr-only">{t('landing', 'opensInNewTab')}</span>}
    </>
  );
  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${CARD} hover:border-white/40`}>
        {body}
      </a>
    );
  }
  return <div className={CARD}>{body}</div>;
}

export function Brief() {
  const stack: readonly GrokStackItem[] = EVENT.grokStack;
  return (
    <Section id="brief" tag={t('landing', 'briefTag')} title={t('landing', 'briefTitle')} accent="pink">
      <p className="max-w-3xl text-xl leading-relaxed text-white md:text-2xl">{EVENT.brief}</p>
      <h3 id="brief-can-use" className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {t('landing', 'briefWith')}
      </h3>
      <ul aria-labelledby="brief-can-use" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((item) => (
          <li key={item.name} className="min-w-0">
            <StackCard item={item} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
