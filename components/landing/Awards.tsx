import { EVENT, type Criterion, type JuryMember, type Prize } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Announcement, AssetSlot, Card, Section } from './shared';

const PRIZES: readonly Prize[] = EVENT.prizes;
const JURY: readonly JuryMember[] = EVENT.jury;
const CRITERIA: readonly Criterion[] = EVENT.criteria;

function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function Awards() {
  return (
    <Section id="awards" tag={t('landing', 'awardsTag')} title={t('landing', 'awardsTitle')} accent="pink">
      <div className="grid gap-6 lg:grid-cols-3">
        {PRIZES.length === 0 ? (
          <Announcement title={t('landing', 'prizesTitle')} />
        ) : (
          <ListCard title={t('landing', 'prizesTitle')}>
            <ul className="space-y-3">
              {PRIZES.map((p) => (
                <li key={p.title}>
                  <p className="font-semibold text-white">{p.title}</p>
                  {p.description && <p className="text-[var(--text-secondary)]">{p.description}</p>}
                </li>
              ))}
            </ul>
          </ListCard>
        )}

        {JURY.length === 0 ? (
          <Announcement title={t('landing', 'juryTitle')} />
        ) : (
          <ListCard title={t('landing', 'juryTitle')}>
            <ul className="space-y-3">
              {JURY.map((j) => (
                <li key={j.name} className="flex items-center gap-3">
                  <AssetSlot src={j.photo ?? null} kind="photo" label={j.name} width={48} height={48} />
                  <span>
                    <span className="block font-semibold text-white">{j.name}</span>
                    {j.role && <span className="block text-sm text-[var(--text-secondary)]">{j.role}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </ListCard>
        )}

        {CRITERIA.length === 0 ? (
          <Announcement title={t('landing', 'criteriaTitle')} />
        ) : (
          <ListCard title={t('landing', 'criteriaTitle')}>
            <ul className="space-y-3">
              {CRITERIA.map((c) => (
                <li key={c.title}>
                  <p className="font-semibold text-white">
                    {c.title}
                    {c.weight && <span className="ml-2 text-sm text-[var(--blob-pink)]">{c.weight}</span>}
                  </p>
                  {c.description && <p className="text-[var(--text-secondary)]">{c.description}</p>}
                </li>
              ))}
            </ul>
          </ListCard>
        )}
      </div>
    </Section>
  );
}
