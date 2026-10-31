import { EVENT } from '@/lib/event';
import { t } from '@/lib/i18n';
import { JurorAvatar } from './JurorCard';
import { Card, Section } from './shared';

export function Speaker() {
  const { speaker } = EVENT;
  return (
    <Section id="speaker" tag={t('landing', 'speakerTag')} title={t('landing', 'speakerTitle')} accent="blue">
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Same avatar as the jury cards: the photo when set, otherwise initials from the name. */}
        <JurorAvatar name={speaker.name} photo={speaker.photo} size={112} />
        <div>
          <h3 className="font-display text-3xl font-bold text-white">{speaker.name}</h3>
          <p className="mt-1 font-semibold text-[var(--blob-blue-text)]">{speaker.role}</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{speaker.bio}</p>
        </div>
      </Card>
    </Section>
  );
}
