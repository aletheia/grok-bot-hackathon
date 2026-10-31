import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
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

/**
 * Primary CTA: goes to the sign-in page (/register, where the team is created or joined).
 * `hint` is the small line under the button that says which email to sign in with.
 */
export function SignInCta({
  className = '',
  size = 'lg',
  hint = false,
  label,
  href = '/register',
}: {
  className?: string;
  size?: 'md' | 'lg';
  hint?: boolean;
  label?: string;
  href?: string;
}) {
  const sizing = size === 'lg' ? 'min-h-[52px] px-6 text-base sm:text-lg' : 'min-h-[44px] px-4 text-sm';
  const button = (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--blob-orange)] font-bold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#ffa040] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transform-none ${sizing} ${hint ? '' : className}`}
    >
      {label ?? t('landing', 'ctaSignIn')}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
  if (!hint) return button;
  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      {button}
      <p className="px-2 text-sm text-[var(--text-secondary)]">{t('landing', 'ctaSignInHint')}</p>
    </div>
  );
}

/** Luma registration link, labelled by registration status. Primary (orange) by default; `secondary` is an outline button. */
export function LumaCta({
  className = '',
  size = 'lg',
  variant = 'primary',
}: {
  className?: string;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}) {
  const status = EVENT.registration.status;
  const label =
    status === 'open' ? t('landing', 'ctaOpen') : status === 'waitlist' ? t('landing', 'ctaWaitlist') : t('landing', 'ctaClosed');
  const sizing = size === 'lg' ? 'min-h-[52px] px-6 text-base sm:text-lg' : 'min-h-[44px] px-4 text-sm';
  const look =
    variant === 'primary'
      ? 'bg-[var(--blob-orange)] text-black hover:bg-[#ffa040]'
      : 'border border-white/25 text-white hover:border-white/60';

  return (
    <a
      href={EVENT.registration.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-transform hover:-translate-y-0.5 motion-reduce:transform-none ${look} ${sizing} ${className}`}
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
 *
 * `displayHeight` (logos): `width`/`height` are then the file's pixel size and the logo is drawn
 * `displayHeight` px tall with its own aspect ratio, so logos of different shapes line up at one height.
 */
export function AssetSlot({
  src,
  kind,
  label,
  width,
  height,
  displayHeight,
  className = '',
}: {
  src: AssetSrc;
  kind: 'logo' | 'photo';
  label: string;
  width: number;
  height: number;
  displayHeight?: number;
  className?: string;
}) {
  const alt = kind === 'logo' ? `${label} logo` : `Photo of ${label}`;
  const box = displayHeight
    ? { width: Math.round((width * displayHeight) / height), height: displayHeight }
    : { width, height };
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={`${kind === 'photo' ? 'rounded-full object-cover' : 'shrink-0 object-contain'} ${className}`}
        style={box}
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
      style={box}
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
