import { Fragment } from 'react';
import { TBC, TBC_LABEL } from '@/lib/tracks';

/** Visible "To be confirmed" tag. */
export function TbcTag() {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[var(--blob-orange)]/70 px-2 py-0.5 align-middle text-xs font-bold uppercase tracking-[0.1em] text-[var(--blob-orange)]">
      {TBC_LABEL}
    </span>
  );
}

/** Renders track copy, turning each TBC marker into a visible "To be confirmed" tag. */
export function TbcText({ text }: { text: string }) {
  const parts = text.split(TBC);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <TbcTag />}
        </Fragment>
      ))}
    </>
  );
}
