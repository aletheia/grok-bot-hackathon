"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Info, UserPlus } from "lucide-react";
import { EVENT } from "@/lib/event";
import { formatTeamLock, TEAM_LOCK_AT } from "@/lib/teams/rules";
import { formatRome } from "@/lib/time/rome";

const NOTE_MAX = 280;

type Envelope<T> = { success: boolean; data?: T; error?: { message?: string } };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data;
}

function remaining(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}

/** Re-renders every 30 s; null until mounted to avoid hydration mismatches. */
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function useTeamsLocked() {
  const now = useNow();
  return now !== null && now > TEAM_LOCK_AT.getTime();
}

/** Lock countdown + the short version of the team rules, shown at the top of the team section. */
export function TeamLockNotice() {
  const now = useNow();
  const locked = now !== null && now > TEAM_LOCK_AT.getTime();
  const { minMembers, maxMembers } = EVENT.portal.team;

  return (
    <div
      className={`mb-4 rounded-xl border p-4 text-sm ${
        locked ? "border-amber-500/30 bg-amber-500/10 text-amber-100" : "border-[var(--border-color)] bg-white/5 text-[var(--text-secondary)]"
      }`}
    >
      <p className="flex items-center gap-2 font-medium text-white">
        <Clock size={16} />
        {locked
          ? `Teams are locked since ${formatTeamLock()}.`
          : `Teams lock on ${formatTeamLock()}${now !== null ? ` — ${remaining(TEAM_LOCK_AT.getTime() - now)} left` : ""}.`}
      </p>
      <p className="mt-2 flex items-start gap-2">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          Teams have {minMembers}–{maxMembers} people. Share your team&apos;s secret code to let others join; at{" "}
          {maxMembers} the team closes automatically. Teams with {minMembers}+ members at the lock get guaranteed
          seats; everyone else gets the remaining seats first-come, first-served by Luma registration time.{" "}
          {locked ? "You can no longer create, join or leave a team." : null}{" "}
          <Link href="/rules" className="text-white underline">
            How teams work
          </Link>
        </span>
      </p>
    </div>
  );
}

type Availability = { available: boolean; since: string | null; note: string | null };

/** "I'm available" toggle for people without a team. */
export function AvailabilityCard({ step = "No team yet?", title = "Mark yourself as available" }: { step?: string; title?: string } = {}) {
  const locked = useTeamsLocked();
  const [state, setState] = useState<Availability | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Availability>("/api/teams/availability")
      .then((data) => {
        setState(data);
        setNote(data.note ?? "");
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const save = async (available: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const data = await api<Availability>("/api/teams/availability", {
        method: "POST",
        body: JSON.stringify({ available, note }),
      });
      setState(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-emerald-300">{step}</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Register as looking for a team: teams that still have room will see your name, your profile and the note below, and can send you their team code to enter under Join a team. Your email is
        never shown, so add how to reach you (for example a Telegram or LinkedIn handle) and what you like to work on.
        Registering or joining a team removes you from the list.
      </p>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
          Note for teams ({note.length}/{NOTE_MAX})
        </span>
        <textarea
          value={note}
          maxLength={NOTE_MAX}
          rows={3}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Frontend + hardware tinkering. Telegram: @yourhandle"
          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-white outline-none focus:border-emerald-400"
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || locked || state === null}
          onClick={() => void save(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          <UserPlus size={16} />
          {state?.available ? "Update my note" : "I'm looking for a team"}
        </button>
        {state?.available ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void save(false)}
              className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              Remove me from the list
            </button>
            <span className="text-xs text-emerald-300">
              Listed as available since {state.since ? formatRome(new Date(state.since)) : "now"} (Rome time)
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

type AvailablePerson = { userId: string; name: string; image: string | null; note: string | null; since: string };

/** List of people available to join, shown to members of a team that still has room. */
export function AvailablePeople({ seatsLeft }: { seatsLeft: number }) {
  const [items, setItems] = useState<AvailablePerson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: AvailablePerson[] }>("/api/teams/available")
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="border-t border-[var(--border-color)] pt-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        People available to join ({seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left in your team)
      </p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Reach out using the contact they wrote in their note and share your team code with them: they enter it under Join a team.
      </p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {items === null && !error ? <p className="mt-3 text-sm text-[var(--text-muted)]">Loading…</p> : null}
      {items && items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">Nobody is listed as available right now.</p>
      ) : null}
      {items && items.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.userId} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-4 py-3">
              <p className="text-sm font-medium text-white">{p.name}</p>
              <p className="mt-1 whitespace-pre-line break-words text-xs text-[var(--text-secondary)]">
                {p.note || "No note yet."}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Available since {formatRome(new Date(p.since))}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
