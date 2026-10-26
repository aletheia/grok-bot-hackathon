import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import { EVENT, formatDateRange } from '@/lib/event';
import { t } from '@/lib/i18n';
import { Blob } from './Blob';
import { RegistrationNotice } from '@/components/RegistrationNotice';
import { LumaCta, SignInCta } from './shared';

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Decorative mascots (large screens: around the right column) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <Blob variant="pink" size={150} rotate={-12} className="absolute right-[34%] top-36" />
        <Blob variant="orange" size={170} delay={0.6} className="absolute right-[9%] top-28" />
        <Blob variant="teal" size={140} delay={1.1} rotate={8} className="absolute bottom-24 right-[30%]" />
        <Blob variant="blue" size={210} delay={0.3} className="absolute bottom-16 right-[4%]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Small screens: mascots in flow so they never cover text */}
        <div aria-hidden="true" className="mb-8 flex items-end gap-3 lg:hidden">
          <Blob variant="pink" size={52} rotate={-10} />
          <Blob variant="orange" size={58} delay={0.6} />
          <Blob variant="teal" size={50} delay={1.1} />
          <Blob variant="blue" size={68} delay={0.3} />
        </div>

        <p className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] sm:text-base">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-[var(--blob-orange)]" />
            <time dateTime={EVENT.startDate}>{formatDateRange()}</time>
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-4 w-4 text-[var(--blob-pink)]" />
            {EVENT.venue.name}, {EVENT.venue.address.locality}
          </span>
        </p>

        <h1 id="hero-title" className="font-display font-extrabold uppercase leading-[0.95] text-white">
          <span className="block text-[clamp(2.25rem,10.5vw,6rem)]">Grok</span>
          <span className="block text-[clamp(2.25rem,10.5vw,6rem)]">Hackathon</span>
          <span className="mt-3 block text-2xl normal-case text-[var(--blob-teal)] sm:text-4xl md:text-5xl">
            at the Museum
          </span>
        </h1>

        <blockquote className="mt-10 max-w-2xl border-l-4 border-[var(--blob-pink)] pl-5">
          <p className="text-lg leading-relaxed text-white sm:text-xl">“{EVENT.intro.text}”</p>
          <footer className="mt-2 text-sm text-[var(--text-secondary)]">— {EVENT.intro.author}</footer>
        </blockquote>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-start">
          <SignInCta hint />
          <LumaCta variant="secondary" />
          <Link
            href="#schedule"
            className="inline-flex min-h-[52px] items-center rounded-full border border-white/25 px-6 text-base font-semibold text-white hover:border-white/60"
          >
            {t('landing', 'seeSchedule')}
          </Link>
        </div>
        {EVENT.registration.status === 'waitlist' && (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">{t('landing', 'statusWaitlist')}</p>
        )}
        <RegistrationNotice className="mt-10 max-w-3xl" />
        <p className="mt-8 text-sm text-[var(--text-secondary)]">
          {t('landing', 'hostedBy')} <span className="font-semibold text-white">{EVENT.organizer.name}</span>
        </p>
      </div>
    </section>
  );
}
