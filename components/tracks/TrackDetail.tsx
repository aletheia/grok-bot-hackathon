import { ChevronRight } from 'lucide-react';
import type { TrackContent } from '@/lib/tracks';
import { Disclosure } from './Disclosure';

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[var(--text-secondary)]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[var(--blob-teal)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Label({ children }: { children: string }) {
  return <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--blob-teal)]">{children}</h4>;
}

/** One track on /tracks. The essentials are always visible; the rest sits in disclosure panels. */
export function TrackDetail({ track }: { track: TrackContent }) {
  const headingId = `${track.id}-title`;
  return (
    <section
      id={track.id}
      aria-labelledby={headingId}
      className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10"
    >
      <p className="font-mono text-sm font-bold text-[var(--blob-teal)]">Track {track.number}</p>
      <h2 id={headingId} className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
        {track.title}
      </h2>
      <p className="mt-1 text-lg text-[var(--text-secondary)]">{track.subtitle}</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Guiding question</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{track.guidingQuestion}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Main result</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{track.mainResult}</dd>
        </div>
      </dl>

      <div className="mt-8 space-y-6">
        <div>
          <Label>Mission</Label>
          <p className="mt-2 text-white">{track.mission}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>The problem</Label>
            <p className="mt-2 text-[var(--text-secondary)]">{track.problem}</p>
          </div>
          <div>
            <Label>Who it is for</Label>
            <p className="mt-2 text-[var(--text-secondary)]">{track.users}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Disclosure title="Input, output and what makes it distinctive">
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-white">Input</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">{track.input}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Output</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">{track.output}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Distinctive element</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">{track.distinctive}</dd>
            </div>
          </dl>
        </Disclosure>
        <Disclosure title={track.example.title}>
          <p className="text-[var(--text-secondary)]">{track.example.text}</p>
        </Disclosure>
        <Disclosure title="Core features">
          <List items={track.coreFeatures} />
          {track.taxonomy && (
            <div className="mt-6">
              <p className="font-semibold text-white">Initial failure taxonomy</p>
              <ul className="mt-2 space-y-1 text-[var(--text-secondary)]">
                {track.taxonomy.map((row) => (
                  <li key={row.area}>
                    <span className="font-semibold text-white">{row.area}:</span> {row.items}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Disclosure>
        <Disclosure title="A realistic MVP and stretch goals">
          <p className="font-semibold text-white">MVP</p>
          <div className="mt-2">
            <List items={track.mvp} />
          </div>
          <p className="mt-5 font-semibold text-white">Stretch goals</p>
          <div className="mt-2">
            <List items={track.stretch} />
          </div>
        </Disclosure>
        {track.risks && (
          <Disclosure title="Risks">
            <p className="text-[var(--text-secondary)]">{track.risks}</p>
          </Disclosure>
        )}
        <Disclosure title="How it will be evaluated (indicative)">
          <p className="text-[var(--text-secondary)]">{track.evaluation}</p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            These are indicative pointers for this track. The final judging criteria will be announced separately.
          </p>
        </Disclosure>
        <div className="border-t border-white/10" />
      </div>
    </section>
  );
}
