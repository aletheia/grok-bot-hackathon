import Image from 'next/image';
import { EVENT, type HardwareItem } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Card, Section } from './shared';

type IllustratedItem = HardwareItem & { image: NonNullable<HardwareItem['image']> };

/**
 * Illustrated cards only show items that have a drawing. The drawings are white line art on
 * transparent PNGs, so each one sits on its own dark panel (--bg-tertiary, like the sponsor tiles)
 * with an equal fixed-height box and object-contain: same card height, no layout shift, never behind text.
 * Items without a drawing (drones) are listed as plain text under the grid.
 */
export function Hardware() {
  const hardware: readonly HardwareItem[] = EVENT.hardware;
  const illustrated = hardware.filter((item): item is IllustratedItem => Boolean(item.image));
  const textOnly = hardware.filter((item) => !item.image);

  return (
    <Section id="hardware" tag={t('landing', 'hardwareTag')} title={t('landing', 'hardwareTitle')} accent="orange">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {illustrated.map((item) => (
          <li key={item.id}>
            <Card className="flex h-full flex-col gap-5 !p-4 md:!p-5">
              <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] p-4 sm:h-48">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  unoptimized
                  className="h-auto max-h-full w-auto max-w-full object-contain"
                />
              </div>
              <span className="px-1 pb-1 font-display text-xl font-bold text-white">{item.name}</span>
            </Card>
          </li>
        ))}
      </ul>
      {textOnly.length > 0 && (
        <p className="mt-6 text-lg font-semibold text-white">
          <span className="text-[var(--text-secondary)]">{t('landing', 'hardwareAlsoLead')}</span>{' '}
          {textOnly.map((item) => item.name).join(', ')}
        </p>
      )}
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">{EVENT.hardwareNote}</p>
    </Section>
  );
}
