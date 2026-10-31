import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { JuryMember } from '@/lib/event';
import { t } from '@/lib/i18n';
import { getInitials, getJurorAccent, getJurorBio, getPhotoAlt } from '@/lib/jury';
import { JurorReadMore } from './JurorReadMore';

const AVATAR = 88;
/** Jury grid avatar: 64 px in the 2-column mobile grid, 88 px from sm up. Same box for photo, initials and "?". */
const GRID_AVATAR = 'h-16 w-16 text-[23px] sm:h-[88px] sm:w-[88px] sm:text-[32px]';

/**
 * Square-cropped circular photo, or a decorative initials avatar in the juror's accent colour.
 * `size` fixes the px size (speaker, read-more dialog); `sizeClassName` sizes it with classes instead (jury grid).
 */
export function JurorAvatar({ name, photo, size = AVATAR, sizeClassName }: { name: string; photo?: string | null; size?: number; sizeClassName?: string }) {
  const fixed = sizeClassName ? undefined : { width: size, height: size };
  if (photo) {
    return (
      <Image
        src={photo}
        alt={getPhotoAlt(name)}
        width={size}
        height={size}
        unoptimized
        className={`aspect-square shrink-0 rounded-full object-cover ${sizeClassName ?? ''}`.trim()}
        style={fixed}
      />
    );
  }
  const accent = getJurorAccent(name);
  return (
    <div
      aria-hidden="true"
      data-avatar="initials"
      data-accent={accent.name}
      className={`flex shrink-0 select-none items-center justify-center rounded-full font-display font-extrabold tracking-wide ${sizeClassName ?? ''}`.trim()}
      style={{ ...fixed, backgroundColor: accent.bg, color: accent.fg, ...(sizeClassName ? {} : { fontSize: Math.round(size * 0.36) }) }}
    >
      {getInitials(name)}
    </div>
  );
}

// Height fits the content (no min-heights); the grid stretches cards in the same row to one height.
// Every card starts the same way: fixed-size avatar, then the name at the same offset, so names share a baseline
// in a row. Role line, bio and footer (Read more / Profile) render only when they have content.
const CARD = 'flex h-full flex-col items-start rounded-3xl';
const NAME = 'mt-3 text-base font-bold leading-snug text-white sm:mt-4 sm:text-lg';
const ROLE = 'mt-1 text-sm leading-5 text-[var(--text-secondary)]';
const BIO = 'mt-3 line-clamp-2 leading-6 text-[var(--text-secondary)]';
const FOOTER = 'mt-auto flex flex-wrap items-center gap-x-5 pt-3';

export function JurorPlaceholder() {
  return (
    <li className={`${CARD} border-2 border-dashed border-white/15 p-[15px] sm:p-[22px]`} data-placeholder="juror">
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/25 font-bold text-white/40 ${GRID_AVATAR}`}
      >
        ?
      </div>
      <h3 className={NAME}>{t('landing', 'tba')}</h3>
      <p className={ROLE}>{t('landing', 'jurorRole')}</p>
    </li>
  );
}

export function JurorCard({ juror }: { juror: JuryMember & { name: string } }) {
  const roleParts = [juror.role, juror.org].map((s) => s?.trim()).filter((s): s is string => Boolean(s));
  const roleLine = roleParts.join(' · ');
  const { short, full } = getJurorBio(juror);
  return (
    <li className={`${CARD} border border-white/10 bg-white/[0.04] p-4 sm:p-[23px]`} data-juror={juror.name}>
      <JurorAvatar name={juror.name} photo={juror.photo ?? null} sizeClassName={GRID_AVATAR} />
      <h3 className={NAME}>{juror.name}</h3>
      {roleLine && (
        <p className={ROLE}>
          {/* Narrow 2-column mobile cards: role and org stack on two lines (no separator left dangling at a line end). */}
          {roleParts.map((part, i) => (
            <span key={part}>
              {i > 0 && <span aria-hidden="true" className="hidden sm:inline"> · </span>}
              <span className="block sm:inline">{part}</span>
            </span>
          ))}
        </p>
      )}
      {short && <p className={BIO}>{short}</p>}
      {(full || juror.link) && (
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
      )}
    </li>
  );
}
