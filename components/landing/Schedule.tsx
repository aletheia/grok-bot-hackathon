import { EVENT, formatDayLabel, type ScheduleDay } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Section } from './shared';

const DAYS: readonly ScheduleDay[] = EVENT.schedule;
const DAY_ACCENTS = ['var(--blob-pink)', 'var(--blob-teal)'];

export function Schedule() {
  return (
    <Section id="schedule" tag={t('landing', 'scheduleTag')} title={t('landing', 'scheduleTitle')} accent="teal">
      <div className="grid gap-6 lg:grid-cols-2">
        {DAYS.map((day, i) => {
          const accent = DAY_ACCENTS[i % DAY_ACCENTS.length];
          return (
            <div key={day.date} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <h3 className="font-display text-2xl font-bold text-white">
                <time dateTime={day.date}>{formatDayLabel(day.date)}</time>
              </h3>
              <ol className="mt-6 space-y-5 border-l-2 pl-5" style={{ borderColor: accent }}>
                {day.items.map((item, j) => (
                  <li key={j} className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                    <span className="font-mono text-base font-semibold tabular-nums" style={{ color: accent }}>
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
                      <span className="block text-lg font-semibold text-white">{item.title}</span>
                      {item.invitationOnly && (
                        <span
                          className="mt-1 inline-block rounded-full border-2 px-3 py-0.5 font-mono text-base font-semibold"
                          style={{ borderColor: accent, color: accent }}
                        >
                          {t('landing', 'invitationOnly')}
                        </span>
                      )}
                      {item.detail && <span className="block text-[var(--text-secondary)]">{item.detail}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-[var(--text-secondary)]">{t('landing', 'scheduleTz')}</p>
    </Section>
  );
}
