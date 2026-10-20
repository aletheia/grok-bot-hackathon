import type { ReactNode } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { EVENT, type AssetSrc } from '@/lib/event';
import { t } from '@/lib/i18n';

type Accent = 'pink' | 'orange' | 'teal' | 'blue';

const TAG_COLORS: Record<Accent, string> = {
  pink: 'text-[var(--blob-pink)]',
  orange: 'text-[var(--blob-orange)]',
  teal: 'text-[var(--blob-teal)]',
  blue: 'text-[var(--blob-blue-text)]',
};

export function Section({
  id,
  tag,
  title,
  accent = 'orange',
  children,
  className = '',
}: {
  id: string;
  tag: string;
  title?: string;
  accent?: Accent;
  children: ReactNode;
  className?: string;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={`scroll-mt-24 py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className={`mb-3 text-sm font-bold uppercase tracking-[0.18em] ${TAG_COLORS[accent]}`}>{tag}</p>
        {title ? (
          <h2 id={headingId} className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h2>
        ) : (
          <h2 id={headingId} className="sr-only">
            {tag}
          </h2>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/** Primary CTA: always points at the Luma page, labelled by registration status. */
export function LumaCta({ className = '', size = 'lg' }: { className?: string; size?: 'md' | 'lg' }) {
  const status = EVENT.registration.status;
  const label =
    status === 'open' ? t('landing', 'ctaOpen') : status === 'waitlist' ? t('landing', 'ctaWaitlist') : t('landing', 'ctaClosed');
  const sizing = size === 'lg' ? 'min-h-[52px] px-6 text-base sm:text-lg' : 'min-h-[44px] px-4 text-sm';

  return (
    <a
      href={EVENT.registration.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--blob-orange)] font-bold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#ffa040] motion-reduce:transform-none ${sizing} ${className}`}
    >
      {label}
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
    </a>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8 ${className}`}>{children}</div>
  );
}

/**
 * Logo or photo slot. With a src it renders the image; with `null` it renders a
 * clearly labelled placeholder so missing assets are obvious (set them in lib/event.ts).
 */
export function AssetSlot({
  src,
  kind,
  label,
  width,
  height,
  className = '',
}: {
  src: AssetSrc;
  kind: 'logo' | 'photo';
  label: string;
  width: number;
  height: number;
  className?: string;
}) {
  const alt = kind === 'logo' ? `${label} logo` : `Photo of ${label}`;
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={`${kind === 'photo' ? 'rounded-full object-cover' : 'object-contain'} ${className}`}
        style={{ width, height }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${kind === 'logo' ? 'Logo' : 'Photo'} placeholder: ${label}`}
      className={`flex shrink-0 items-center justify-center border-2 border-dashed border-white/25 bg-white/[0.03] p-1 text-center text-[11px] font-semibold uppercase leading-tight tracking-wide text-[var(--text-secondary)] ${
        kind === 'photo' ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
      style={{ width, height }}
      data-placeholder={kind}
    >
      {kind === 'logo' ? `${label} logo` : 'Photo'}
    </div>
  );
}

/** "To be announced" card for sections driven by empty config arrays. */
export function Announcement({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-white/15 p-6 md:p-8">
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
        {t('landing', 'tba')}
      </p>
      <p className="mt-3 text-[var(--text-secondary)]">{t('landing', 'tbaNote')}</p>
    </div>
  );
}
