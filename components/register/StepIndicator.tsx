import { Check } from "lucide-react";

export const REGISTER_STEPS = ["Email", "Code", "You’re in"] as const;

type StepState = "done" | "current" | "todo";

/** `current` is 1-based; 4 means every step is complete. State is never colour only: check / number / outline + sr-only text. */
export function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Sign-in progress" className="mb-4 sm:mb-5">
      <ol className="flex items-center gap-2 text-[13px] sm:gap-3 sm:text-sm">
        {REGISTER_STEPS.map((label, i) => {
          const n = i + 1;
          const state: StepState = n < current ? "done" : n === current ? "current" : "todo";
          const circle = {
            done: "bg-[var(--accent-green)] text-[#0a0a0a]",
            current: "bg-[var(--blob-orange)] text-[#0a0a0a]",
            todo: "border-2 border-[var(--border-input)] text-[var(--text-secondary)]",
          }[state];
          const text =
            state === "current" ? "font-semibold text-white" : state === "done" ? "text-white" : "text-[var(--text-secondary)]";
          const sr = state === "done" ? " (completed)" : state === "current" ? " (current step)" : "";
          return (
            <li key={label} className="contents">
              <span aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${circle}`}
                >
                  {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : n}
                </span>
                <span className={text}>
                  <span className="sr-only">Step {n} of 3: </span>
                  {label}
                  <span className="sr-only">{sr}</span>
                </span>
              </span>
              {i < REGISTER_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`h-0.5 min-w-3 flex-1 rounded-full ${n < current ? "bg-[var(--accent-green)]" : "bg-[var(--border-hover)]"}`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
