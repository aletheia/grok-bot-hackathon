import { ChevronRight } from 'lucide-react';
import type { TrackContent } from '@/lib/tracks';
import { Disclosure } from './Disclosure';
import { TbcText } from './TbcText';

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[var(--text-secondary)]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[var(--blob-teal)]" />
          <span>
            <TbcText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Label({ children }: { children: string }) {
  return <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--blob-teal)]">{children}</h4>;
}

function Text({ text, strong = false }: { text: string; strong?: boolean }) {
  return (
    <p className={`mt-2 ${strong ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
      <TbcText text={text} />
    </p>
  );
}

/**
 * One track on /tracks, with the fields of the track card in the order of the source document.
 * The essentials are always visible; the rest sits in disclosure panels.
 */
export function TrackDetail({ track }: { track: TrackContent }) {
  const headingId = `${track.id}-title`;
  return (
    <section
      id={track.id}
      aria-labelledby={headingId}
      className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10"
    >
      <p className="font-mono text-sm font-bold text-[var(--blob-teal)]">
        Track {track.number}
        <span className="font-sans font-semibold text-[var(--text-secondary)]"> · Proposed by {track.proposedBy}</span>
      </p>
      <h2 id={headingId} className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
        {track.title}
      </h2>
      {track.subtitle && <p className="mt-1 text-lg text-[var(--text-secondary)]">{track.subtitle}</p>}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">In one sentence</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{track.oneLiner}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Hardware</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{track.hardwareSummary}</dd>
        </div>
      </dl>

      <div className="mt-8 space-y-6">
        <div>
          <Label>Context</Label>
          <Text text={track.context} />
        </div>
        <div>
          <Label>What to build</Label>
          <Text text={track.build} strong />
        </div>
      </div>

      <div className="mt-8">
        <Disclosure title="Inputs provided">
          <p className="text-[var(--text-secondary)]">
            <TbcText text={track.inputs} />
          </p>
        </Disclosure>
        <Disclosure title="Use of Grok">
          <p className="text-[var(--text-secondary)]">
            <TbcText text={track.grok} />
          </p>
        </Disclosure>
        <Disclosure title="Minimum demo and stretch goals">
          <p className="font-semibold text-white">Minimum demo</p>
          {track.demo.lead && <p className="mt-2 text-[var(--text-secondary)]">{track.demo.lead}</p>}
          <div className="mt-2">
            <List items={track.demo.items} />
          </div>
          {track.demo.note && <p className="mt-3 text-[var(--text-secondary)]">{track.demo.note}</p>}
          <p className="mt-5 font-semibold text-white">Stretch goals</p>
          <div className="mt-2">
            <List items={track.stretch} />
          </div>
          {track.taxonomy && (
            <div className="mt-6">
              <p className="font-semibold text-white">Starting failure categories</p>
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
        <Disclosure title="Out of scope">
          <p className="text-[var(--text-secondary)]">
            <TbcText text={track.outOfScope} />
          </p>
        </Disclosure>
        <Disclosure title="How it's judged">
          <p className="text-[var(--text-secondary)]">
            <TbcText text={track.judging} />
          </p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            These criteria are specific to this track and add to the common judging rubric, which will be announced
            separately.
          </p>
        </Disclosure>
        <Disclosure title="Hardware, seats and mentors">
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-white">Hardware and seats</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">
                <TbcText text={track.hardware} />
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Mentors</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">
                <TbcText text={track.mentors} />
              </dd>
            </div>
          </dl>
        </Disclosure>
        <div className="border-t border-white/10" />
      </div>
    </section>
  );
}
