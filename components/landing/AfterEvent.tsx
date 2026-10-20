import { EVENT } from '@/lib/event';
import { t } from '@/lib/i18n';
import { AssetSlot, Section } from './shared';
import { ExtLink } from './Venue';

export function AfterEvent() {
  const { followUp, assets } = EVENT;
  return (
    <Section id="startup-weekend" tag={t('landing', 'afterTag')} title={followUp.name} accent="teal">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <AssetSlot src={assets.logos.startupWeekend} kind="logo" label="Startup Weekend" width={120} height={72} />
        <div>
          <p className="max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">{followUp.text}</p>
          <div className="mt-6">
            {followUp.url ? (
              <ExtLink href={followUp.url}>{t('landing', 'followUpLink')}</ExtLink>
            ) : (
              <span
                className="inline-flex min-h-[44px] items-center rounded-full border-2 border-dashed border-white/25 px-5 text-sm font-semibold text-[var(--text-secondary)]"
                data-placeholder="link"
              >
                {t('landing', 'followUpLink')}: link coming soon
              </span>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
