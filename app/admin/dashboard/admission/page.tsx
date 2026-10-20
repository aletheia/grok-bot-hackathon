"use client";

import { useEffect, useState } from "react";
import { formatRome } from "@/lib/time/rome";

type Member = { userId: string; name: string; email: string };
type FormedTeam = { id: number; name: string; size: number; members: Member[] };
type QueueEntry = {
  position: number;
  email: string;
  name: string | null;
  userId: string | null;
  teamName: string | null;
  teamSize: number;
  availableForTeam: boolean;
  orderedBy: "luma_registration" | "portal_account" | "import" | "none";
  orderAt: string | null;
  admitted: boolean;
};
type Overview = {
  capacity: number;
  guaranteedSeats: number;
  remainingSeats: number;
  admittedFromQueue: number;
  formedTeams: FormedTeam[];
  queue: QueueEntry[];
  teamLockAt: string;
  teamsLocked: boolean;
  guestListSize: number;
  orderingRule: string;
};

const ORDER_LABEL: Record<QueueEntry["orderedBy"], string> = {
  luma_registration: "Luma registration",
  portal_account: "Portal account",
  import: "CSV import",
  none: "No timestamp",
};

export default function AdmissionPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/admission", { credentials: "include" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
        setData(json.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>;
  if (!data) return <div className="text-[var(--text-muted)]">Loading…</div>;

  const stat = (label: string, value: string | number) => (
    <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admission</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Teams with 4 or more members are formed and all their members get guaranteed seats. Everyone else on the Luma
          guest list (except declined) is admitted first-come, first-served until the capacity is reached. Order:{" "}
          {data.orderingRule} Team lock: {formatRome(new Date(data.teamLockAt))} (Rome time) —{" "}
          {data.teamsLocked ? "locked, figures are final." : "not locked yet, figures are provisional."} This page sends
          no emails.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {stat("Capacity", data.capacity)}
        {stat("Guaranteed (formed teams)", data.guaranteedSeats)}
        {stat("Remaining seats (FCFS)", data.remainingSeats)}
        {stat("Queue length", data.queue.length)}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Formed teams ({data.formedTeams.length})</h2>
        {data.formedTeams.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No team has 4 or more members yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.formedTeams.map((t) => (
              <div key={t.id} className="rounded-xl border border-[var(--border-color)] p-4">
                <div className="flex justify-between text-white">
                  <span className="font-semibold">{t.name}</span>
                  <span>{t.size} members</span>
                </div>
                <ul className="mt-2 text-sm text-[var(--text-secondary)]">
                  {t.members.map((m) => (
                    <li key={m.userId}>
                      {m.name} · {m.email}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">First-come, first-served queue</h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Ordered by</th>
                <th className="px-3 py-2">Timestamp (Rome)</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Seat</th>
              </tr>
            </thead>
            <tbody>
              {data.queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-[var(--text-muted)]">
                    Queue is empty. Import the Luma guest list first.
                  </td>
                </tr>
              ) : (
                data.queue.map((q) => (
                  <tr key={q.email} className="border-t border-[var(--border-color)] text-white">
                    <td className="px-3 py-2">{q.position}</td>
                    <td className="px-3 py-2">
                      {q.name ?? "—"}
                      {!q.userId ? <span className="ml-2 text-xs text-[var(--text-muted)]">(never signed in)</span> : null}
                    </td>
                    <td className="px-3 py-2">{q.email}</td>
                    <td className="px-3 py-2">{ORDER_LABEL[q.orderedBy]}</td>
                    <td className="px-3 py-2">{q.orderAt ? formatRome(new Date(q.orderAt)) : "—"}</td>
                    <td className="px-3 py-2">
                      {q.teamName ? `${q.teamName} (${q.teamSize})` : q.availableForTeam ? "Available" : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {q.admitted ? (
                        <span className="text-emerald-300">Admitted</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">Waitlist</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
