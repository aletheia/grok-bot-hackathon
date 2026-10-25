"use client";

import { useState, type Ref } from "react";
import { sanitizeOtp } from "@/lib/auth/otp-messages";

const LENGTH = 6;

/**
 * One real <input> (paste, SMS autofill and screen readers keep working) sitting invisibly on top of six
 * decorative boxes. The value is never cleared by this component, only by its owner.
 */
export function OtpInput({
  id,
  value,
  onChange,
  inputRef,
  readOnly = false,
  dead = false,
  invalid = false,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  readOnly?: boolean;
  /** Expired or locked: the code stays visible but cannot be edited. */
  dead?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, LENGTH - 1);

  return (
    <div className="relative">
      <div className="flex gap-1.5 sm:gap-3" aria-hidden="true" data-testid="otp-boxes">
        {Array.from({ length: LENGTH }, (_, i) => {
          const active = focused && !dead && i === activeIndex;
          const border = invalid ? "border-[var(--danger)]" : active ? "border-[var(--blob-orange)]" : "border-[var(--border-input)]";
          return (
            <div
              key={i}
              className={`relative grid h-14 min-w-0 flex-1 place-items-center rounded-xl border-2 font-mono text-2xl font-semibold text-white sm:h-16 sm:text-3xl ${border} ${
                active ? "bg-white/5" : "bg-black/40"
              } ${dead ? "opacity-75" : ""} ${i === 3 ? "ml-1 sm:ml-2" : ""}`}
            >
              {value[i] ?? (active ? <span className="h-7 w-0.5 animate-pulse rounded bg-[var(--blob-orange)]" /> : null)}
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        id={id}
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={LENGTH}
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        readOnly={readOnly || dead}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(e) => onChange(sanitizeOtp(e.target.value))}
        onPaste={(e) => {
          // maxLength would cut "123 456" to "123 45" before the space can be stripped.
          e.preventDefault();
          onChange(sanitizeOtp(e.clipboardData.getData("text")));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="otp-input absolute inset-0 h-full w-full cursor-text rounded-xl bg-transparent text-transparent caret-transparent selection:bg-transparent selection:text-transparent"
      />
    </div>
  );
}
