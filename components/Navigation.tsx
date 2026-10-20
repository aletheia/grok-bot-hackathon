'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Logo } from '@/components/ui';
import { LumaCta } from '@/components/landing/shared';
import { t } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';

const NAV_ITEMS = [
  { key: 'brief', href: '/#brief' },
  { key: 'hardware', href: '/#hardware' },
  { key: 'schedule', href: '/#schedule' },
  { key: 'teams', href: '/#teams' },
  { key: 'venue', href: '/#venue' },
] as const;

/** Landing navigation. The primary CTA is the Luma page; the portal is reached via "Sign in" / "Dashboard". */
export function Navigation() {
  const { data: session } = authClient.useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const linkClass = 'inline-flex min-h-[44px] items-center px-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-white';
  const portal = session?.user ? { href: '/dashboard', label: t('nav', 'dashboard') } : { href: '/register', label: t('nav', 'signIn') };

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-black"
      >
        {t('nav', 'skipToContent')}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors ${
          isScrolled || open ? 'border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <nav aria-label={t('nav', 'primary')} className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 md:h-20">
          <Link href="/" className="flex min-h-[44px] items-center gap-3" aria-label={`${siteConfig.shortName} — ${t('nav', 'home')}`}>
            <Logo size={36} />
            <span className="hidden font-display text-base font-extrabold uppercase text-white sm:block">{siteConfig.shortName}</span>
          </Link>

          <ul className="hidden items-center gap-3 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <a href={item.href} className={linkClass}>
                  {t('nav', item.key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link href={portal.href} className={`${linkClass} hidden sm:inline-flex`}>
              {portal.label}
            </Link>
            <div className="hidden md:block">
              <LumaCta size="md" />
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t('nav', 'menuClose') : t('nav', 'menuOpen')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
            >
              {open ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {open && (
          <div id="mobile-menu" className="border-t border-white/10 px-5 pb-6 pt-2 lg:hidden">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <a href={item.href} onClick={() => setOpen(false)} className="flex min-h-[48px] items-center text-lg font-semibold text-white">
                    {t('nav', item.key)}
                  </a>
                </li>
              ))}
              <li>
                <Link href={portal.href} className="flex min-h-[48px] items-center text-lg font-semibold text-white">
                  {portal.label}
                </Link>
              </li>
            </ul>
            <div className="mt-4">
              <LumaCta size="md" />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
