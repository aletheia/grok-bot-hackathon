'use client';

import { CarFront, Dog, Drone, Plane, type LucideIcon } from 'lucide-react';
import { EVENT, type HardwareItem } from '@/lib/event';
import { useLanguage } from '@/lib/LanguageContext';
import { BLOB_COLORS, type BlobVariant } from './Blob';
import { Card, Section, useL } from './shared';

const ICONS: Record<HardwareItem['id'], { icon: LucideIcon; color: BlobVariant }> = {
  'robot-dog': { icon: Dog, color: 'pink' },
  'driving-sim': { icon: CarFront, color: 'orange' },
  'flight-sim': { icon: Plane, color: 'teal' },
  drones: { icon: Drone, color: 'blue' },
};

export function Hardware() {
  const { t } = useLanguage();
  const l = useL();
  return (
    <Section id="hardware" tag={t('landing', 'hardwareTag')} title={t('landing', 'hardwareTitle')} accent="orange">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EVENT.hardware.map((item) => {
          const { icon: Icon, color } = ICONS[item.id];
          return (
            <li key={item.id}>
              <Card className="flex h-full flex-col gap-5">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: BLOB_COLORS[color] }}
                >
                  <Icon aria-hidden="true" className="h-7 w-7 text-black" />
                </span>
                <span className="font-display text-xl font-bold text-white">{l(item.name)}</span>
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">{l(EVENT.hardwareNote)}</p>
    </Section>
  );
}
