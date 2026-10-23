import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { JuryMember } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getInitials, getJurorAccent, getJurorBio, getPhotoAlt } from '@/lib/jury';
import { JurorReadMore } from './JurorReadMore';

const AVATAR = 88;

/** Square-cropped circular photo, or a decorative initials avatar in the juror's accent colour. */
export function JurorAvatar({ name, photo, size = AVATAR }: { name: string; photo?: string | null; size?: number }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt={getPhotoAlt(name)}
        width={size}
        height={size}
        unoptimized
        className="aspect-square shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const accent = getJurorAccent(name);
  return (
    <div
      aria-hidden="true"
      data-avatar="initials"
      data-accent={accent.name}
      className="flex shrink-0 select-none items-center justify-center rounded-full font-display font-extrabold tracking-wide"
      style={{ width: size, height: size, backgroundColor: accent.bg, color: accent.fg, fontSize: Math.round(size * 0.36) }}
    >
      {getInitials(name)}
    </div>
  );
}

const CARD = 'flex h-full flex-col items-start rounded-3xl';
// Same structure for every card: avatar, name, role line, 2-line bio, footer row (Read more / Profile).
const NAME = 'mt-4 text-lg font-bold leading-snug text-white';
const ROLE = 'mt-1 min-h-[2.5rem] text-sm leading-5 text-[var(--text-secondary)]';
const BIO = 'mt-3 line-clamp-2 min-h-[3rem] leading-6 text-[var(--text-secondary)]';
const FOOTER = 'mt-auto flex min-h-[56px] flex-wrap items-center gap-x-5 pt-3';

export function JurorPlaceholder() {
  return (
    <li className={`${CARD} border-2 border-dashed border-white/15 p-[22px]`} data-placeholder="juror">
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/25 text-3xl font-bold text-white/40"
        style={{ width: AVATAR, height: AVATAR }}
      >
        ?
      </div>
      <h3 className={NAME}>{t('landing', 'tba')}</h3>
      <p className={ROLE}>{t('landing', 'jurorRole')}</p>
      <p className={BIO}>{t('landing', 'jurorBio')}</p>
      <div className={FOOTER} />
    </li>
  );
}

export function JurorCard({ juror }: { juror: JuryMember & { name: string } }) {
  const roleLine = [juror.role, juror.org]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(' · ');
  const { short, full } = getJurorBio(juror);
  return (
    <li className={`${CARD} border border-white/10 bg-white/[0.04] p-[23px]`} data-juror={juror.name}>
      <JurorAvatar name={juror.name} photo={juror.photo ?? null} />
      <h3 className={NAME}>{juror.name}</h3>
      <p className={ROLE}>{roleLine}</p>
      <p className={BIO}>{short}</p>
      <div className={FOOTER}>
        {full && (
          <JurorReadMore
            name={juror.name}
            subtitle={roleLine || undefined}
            bio={full}
            readMore={t('landing', 'readMore')}
            close={t('landing', 'close')}
            avatar={<JurorAvatar name={juror.name} photo={juror.photo ?? null} size={56} />}
          />
        )}
        {juror.link && (
          <a
            href={juror.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-white underline-offset-4 hover:underline"
          >
            {t('landing', 'jurorLink')}
            <span className="sr-only">
              {' '}
              {juror.name} {t('landing', 'opensInNewTab')}
            </span>
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        )}
      </div>
    </li>
  );
}
