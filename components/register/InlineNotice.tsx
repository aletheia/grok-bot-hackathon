import type { ReactNode } from "react";
import { AlertCircle, Check, ExternalLink, Info } from "lucide-react";

export type NoticeTone = "error" | "info" | "ok";

const TONE: Record<NoticeTone, { box: string; icon: string }> = {
  error: { box: "border-[var(--danger)]/60 bg-[var(--danger)]/10 text-[var(--danger-text)]", icon: "text-[var(--danger)]" },
  ok: { box: "border-[var(--accent-green)]/50 bg-[var(--accent-green)]/10 text-white", icon: "text-[var(--accent-green)]" },
  info: { box: "border-[var(--blob-teal)]/60 bg-[var(--blob-teal)]/10 text-white", icon: "text-[var(--blob-teal)]" },
};

/** Icon + border + text (never colour only). Put it inside a wrapper that already has role="alert" / "status". */
export function InlineNotice({ tone, children }: { tone: NoticeTone; children: ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : tone === "ok" ? Check : Info;
  const t = TONE[tone];
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-[15px] leading-snug ${t.box}`}>
      <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${t.icon}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** External Luma link used under the guest-list notices and in the page footer. */
export function LumaLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center gap-1.5 font-semibold text-white underline underline-offset-4 ${className}`}
    >
      {children}
      <ExternalLink aria-hidden="true" className="size-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
