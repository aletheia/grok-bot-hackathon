import { EVENT, type Prize } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getPodium, getSpecialPrizes, type PodiumSlot } from '@/lib/landing-content';
import { Section } from './shared';

const PRIZES: readonly Prize[] = EVENT.prizes;

/** Desktop podium order is 2nd · 1st · 3rd with the winner raised; on mobile the natural 1 → 3 order is kept. */
const PODIUM_STYLE: Record<PodiumSlot['place'], { order: string; height: string; accent: string; label: string }> = {
  1: { order: 'md:order-2', height: 'md:min-h-[22rem]', accent: 'text-[var(--blob-orange)]', label: 'place1' },
  2: { order: 'md:order-1', height: 'md:min-h-[19rem]', accent: 'text-[var(--blob-teal)]', label: 'place2' },
  3: { order: 'md:order-3', height: 'md:min-h-[17rem]', accent: 'text-[var(--blob-pink)]', label: 'place3' },
};

function PodiumCard({ slot }: { slot: PodiumSlot }) {
  const style = PODIUM_STYLE[slot.place];
  const { prize } = slot;
  const frame = prize
    ? 'border border-white/10 bg-white/[0.04]'
    : 'border-2 border-dashed border-white/15';

  return (
    <li className={`flex flex-col rounded-3xl p-6 md:justify-end md:p-8 ${frame} ${style.order} ${style.height}`} data-placeholder={prize ? undefined : 'prize'}>
      <p aria-hidden="true" className={`font-display text-5xl font-extrabold leading-none ${style.accent}`}>
        {slot.place}
      </p>
      <h3 className="mt-3 font-display text-xl font-bold text-white">{t('landing', style.label)}</h3>
      {prize?.title && <p className="mt-1 font-semibold text-white">{prize.title}</p>}
      {prize?.reward ? (
        <p className={`mt-3 text-lg font-bold ${style.accent}`}>{prize.reward}</p>
      ) : (
        <p className="mt-3 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">{t('landing', 'prizeTba')}</p>
      )}
      {prize?.description && <p className="mt-3 text-[var(--text-secondary)]">{prize.description}</p>}
      {prize?.track && (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t('landing', 'trackLabel')}: <span className="font-semibold text-white">{prize.track}</span>
        </p>
      )}
    </li>
  );
}

export function Prizes() {
  const podium = getPodium(PRIZES);
  const special = getSpecialPrizes(PRIZES);

  return (
    <Section id="prizes" tag={t('landing', 'prizesTag')} title={t('landing', 'prizesTitle')} accent="pink">
      <p className="-mt-4 mb-8 max-w-2xl text-lg text-[var(--text-secondary)]">{t('landing', 'prizesNote')}</p>
      <ol className="grid gap-4 md:grid-cols-3 md:items-end md:gap-6">
        {podium.map((slot) => (
          <PodiumCard key={slot.place} slot={slot} />
        ))}
      </ol>

      {special.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-xl font-bold text-white">{t('landing', 'specialPrizesTitle')}</h3>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {special.map((p) => (
              <li key={p.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="font-semibold text-white">{p.title}</p>
                <p className="mt-1 text-[var(--blob-pink)]">{p.reward || t('landing', 'prizeTba')}</p>
                {p.description && <p className="mt-2 text-[var(--text-secondary)]">{p.description}</p>}
                {p.track && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {t('landing', 'trackLabel')}: <span className="font-semibold text-white">{p.track}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
