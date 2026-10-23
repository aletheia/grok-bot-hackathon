'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * "Read more" control for a juror whose full bio does not fit the card. A button (44px target, aria-expanded)
 * opens a native modal <dialog>: focus moves into it, Esc closes it, focus returns to the button. A dialog
 * instead of an inline expansion keeps every card in the grid the same height.
 */
export function JurorReadMore({
  name,
  subtitle,
  bio,
  readMore,
  close,
  avatar,
}: {
  name: string;
  subtitle?: string;
  bio: string;
  readMore: string;
  close: string;
  avatar: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] items-center font-semibold text-white underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {readMore}
        <span className="sr-only"> {name}</span>
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-white/15 bg-[var(--bg-secondary)] p-0 text-white backdrop:bg-black/70"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {avatar}
            <div className="min-w-0 flex-1">
              <h3 id={titleId} className="text-lg font-bold">
                {name}
              </h3>
              {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
            </div>
          </div>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-[var(--text-secondary)]">{bio}</p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 font-semibold hover:border-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X aria-hidden="true" className="h-4 w-4" />
              {close}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
