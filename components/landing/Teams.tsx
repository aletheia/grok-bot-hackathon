import Link from 'next/link';
import { getTeamRules } from '@/lib/teams/rules';
import { t } from '@/lib/i18n';
import { Section } from './shared';

export function Teams() {
  const rules = getTeamRules();
  return (
    <Section id="teams" tag={t('landing', 'teamsTag')} title={t('landing', 'teamsTitle')} accent="orange">
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule, i) => (
          <li key={rule.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <span className="font-mono text-sm font-bold text-[var(--blob-orange)]">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 text-lg font-bold text-white">{rule.title}</h3>
            <p className="mt-2 text-[var(--text-secondary)]">{rule.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="inline-flex min-h-[44px] items-center rounded-full bg-white px-5 font-semibold text-black hover:bg-white/90"
        >
          {t('landing', 'teamsCta')}
        </Link>
        <Link
          href="/rules"
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/25 px-5 font-semibold text-white hover:border-white/60"
        >
          {t('landing', 'teamsRules')}
        </Link>
      </div>
    </Section>
  );
}
