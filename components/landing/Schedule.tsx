'use client';

import { EVENT, formatDayLabel, type ScheduleDay } from '@/lib/event';

const DAYS: readonly ScheduleDay[] = EVENT.schedule;
import { useLanguage } from '@/lib/LanguageContext';
import { Section, useL } from './shared';

const DAY_ACCENTS = ['var(--blob-pink)', 'var(--blob-teal)'];

export function Schedule() {
  const { t, language } = useLanguage();
  const l = useL();
  return (
    <Section id="programma" tag={t('landing', 'scheduleTag')} title={t('landing', 'scheduleTitle')} accent="teal">
      <div className="grid gap-6 lg:grid-cols-2">
        {DAYS.map((day, i) => (
          <div key={day.date} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <h3 className="font-display text-2xl font-bold text-white first-letter:uppercase">
              <time dateTime={day.date}>{formatDayLabel(day.date, language)}</time>
            </h3>
            <ol className="mt-6 space-y-5 border-l-2 pl-5" style={{ borderColor: DAY_ACCENTS[i % DAY_ACCENTS.length] }}>
              {day.items.map((item, j) => (
                <li key={j} className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                  <span className="font-mono text-base font-semibold tabular-nums" style={{ color: DAY_ACCENTS[i % DAY_ACCENTS.length] }}>
                    {item.time ? (
                      <>
                        <time dateTime={`${day.date}T${item.time}`}>{item.time}</time>
                        {item.endTime && (
                          <>
                            –<time dateTime={`${day.date}T${item.endTime}`}>{item.endTime}</time>
                          </>
                        )}
                      </>
                    ) : (
                      t('landing', 'overnight')
                    )}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold text-white">{l(item.title)}</span>
                    {item.detail && <span className="block text-[var(--text-secondary)]">{l(item.detail)}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-[var(--text-secondary)]">{t('landing', 'scheduleTz')}</p>
    </Section>
  );
}
