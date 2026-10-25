"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Lock, MapPin } from "lucide-react";
import { Blob } from "@/components/landing/Blob";
import { EVENT, formatDateRange } from "@/lib/event";
import { getDeadlineLine } from "@/lib/registration-deadline";

/**
 * Above the form on mobile, beside it on desktop. The deadline line comes from EVENT.registration.registrationCloses.
 * Pages are prerendered, so the first paint shows the deadline and the closed wording appears after mount.
 */
export function EventSummaryCard() {
  const [now, setNow] = useState<number | undefined>(undefined);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  const deadline = getDeadlineLine(now ?? 0);

  return (
    <aside
      aria-label="About the event"
      className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-5 lg:sticky lg:top-8 lg:p-7"
    >
      <Blob variant="pink" float={false} rotate={12} className="pointer-events-none absolute right-1 top-3 size-11 lg:right-[72px] lg:top-8 lg:size-14" />
      <Blob variant="orange" float={false} className="pointer-events-none absolute right-12 top-2 hidden size-14 lg:right-5 lg:top-5 lg:block lg:size-[60px]" />

      <p className="inline-flex min-h-7 items-center gap-2 rounded-full border border-[var(--blob-orange)] px-3 text-xs font-bold uppercase tracking-widest text-[var(--blob-orange)]">
        <Lock aria-hidden="true" className="size-3.5" /> Invitation only
      </p>

      <h2 className="mt-3 font-display text-xl font-extrabold uppercase leading-[1.05] sm:text-2xl lg:mt-5 lg:text-[28px]">
        Grok Hackathon
        <br />
        <span className="font-bold normal-case text-[var(--blob-teal)]">at the Museum</span>
      </h2>

      <ul className="mt-3 space-y-1.5 text-[15px] lg:mt-6 lg:space-y-3">
        <li className="flex items-center gap-3">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-[var(--blob-orange)]" />
          <span>
            <span className="sr-only">Date: </span>
            {formatDateRange()}
          </span>
        </li>
        <li className="flex items-center gap-3">
          <MapPin aria-hidden="true" className="size-4 shrink-0 text-[var(--blob-pink)]" />
          <span>
            <span className="sr-only">Place: </span>
            {EVENT.venue.name}, {EVENT.venue.address.locality}
          </span>
        </li>
        <li className="hidden items-center gap-3 lg:flex">
          <Clock aria-hidden="true" className="size-4 shrink-0 text-[var(--blob-teal)]" />
          <span>48 hours</span>
        </li>
      </ul>

      <p className="mt-5 hidden border-t border-[var(--border-color)] pt-5 text-sm leading-relaxed text-[var(--text-secondary)] lg:block">
        A 48-hour AI hackathon with real hardware connected to Grok: a robotic dog, driving and flight simulators, drones.
      </p>
      <p className="mt-3 hidden text-sm text-[var(--text-secondary)] lg:block">
        <span className="font-semibold text-white">{deadline.label}</span> {deadline.text}
      </p>
      <Link
        href="/rules"
        className="mt-1 hidden min-h-11 items-center font-semibold text-white underline underline-offset-4 lg:inline-flex"
      >
        How teams work
      </Link>
    </aside>
  );
}
