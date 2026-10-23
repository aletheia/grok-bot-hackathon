import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Logo } from '@/components/ui';
import { EVENT, formatAddress, formatDateRange } from '@/lib/event';
import { t } from '@/lib/i18n';

export function Footer() {
  const ext = 'inline-flex min-h-[44px] items-center gap-1 font-semibold text-white hover:underline';
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Logo size={32} />
          <div>
            <p className="font-bold text-white">{EVENT.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatDateRange()} · {EVENT.venue.name}, {formatAddress()}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">{EVENT.organizer.name}</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <Link href="/tracks" className={ext}>
              {t('footer', 'tracks')}
            </Link>
          </li>
          <li>
            <Link href="/rules" className={ext}>
              {t('footer', 'rules')}
            </Link>
          </li>
          <li>
            <a href={EVENT.registration.url} target="_blank" rel="noopener noreferrer" className={ext}>
              {t('footer', 'luma')}
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
            </a>
          </li>
          <li>
            <a href={EVENT.venue.url} target="_blank" rel="noopener noreferrer" className={ext}>
              {EVENT.venue.name}
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
