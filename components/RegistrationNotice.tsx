'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { getRegistrationNotice } from '@/lib/registration';

/**
 * Team registration banner. Its text comes from EVENT.registration.registrationOpens/Closes.
 * Pages are statically prerendered, so the first paint uses the build-time answer and the real
 * state (before / open / closed) is re-evaluated in the browser right after mount.
 */
export function RegistrationNotice({
  className = '',
  showRulesLink = true,
}: {
  className?: string;
  showRulesLink?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const notice = getRegistrationNotice(now ?? undefined);
  // Server HTML and the first client render must match: until mounted, show the pre-opening text.
  const shown = now === null ? getRegistrationNotice(0) : notice;

  return (
    <section
      aria-label="Team registration"
      data-registration-state={now === null ? 'before' : shown.state}
      className={`rounded-3xl border border-[var(--blob-orange)]/50 bg-[var(--blob-orange)]/10 p-5 text-left sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <CalendarClock aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[var(--blob-orange)]" />
        <div>
          <p className="font-display text-lg font-bold leading-snug text-white sm:text-xl">{shown.headline}</p>
          {shown.body && <p className="mt-2 max-w-3xl text-[var(--text-secondary)]">{shown.body}</p>}
          {showRulesLink && (
            <Link
              href="/rules"
              className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-white underline underline-offset-4 hover:text-[var(--blob-orange)]"
            >
              How teams work
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
