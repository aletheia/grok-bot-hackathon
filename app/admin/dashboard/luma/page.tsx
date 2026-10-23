"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRome } from "@/lib/time/rome";

type Registrant = {
  email: string;
  name: string | null;
  lumaStatus: string | null;
  lumaRegisteredAt: string | null;
  importedAt: string;
  hasAccount: boolean;
};

type ImportResult = {
  totalRows: number;
  imported: number;
  inserted: number;
  updated: number;
  skippedRows: number[];
  duplicateEmails: number;
};

type SyncInfo = {
  at: string;
  pages: number;
  fetched: number;
  inserted: number;
  existing: number;
  statusChanged: number;
  downgraded: number;
  upgraded: number;
  byStatus: Record<string, number>;
  missingFromLuma: number;
};

async function readJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
  return json.data;
}

export default function LumaGuestListPage() {
  const [items, setItems] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");
  const [syncConfigured, setSyncConfigured] = useState<boolean | null>(null);
  const [lastSync, setLastSync] = useState<SyncInfo | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadSync = useCallback(async () => {
    try {
      const data = await readJson(await fetch("/api/admin/luma-registrants/sync", { credentials: "include" }));
      setSyncConfigured(Boolean(data.configured));
      setLastSync(data.lastSync ?? null);
    } catch {
      setSyncConfigured(false);
    }
  }, []);

  const syncNow = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const data = await readJson(
        await fetch("/api/admin/luma-registrants/sync", { method: "POST", credentials: "include" }),
      );
      setLastSync(data);
      await load();
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readJson(await fetch("/api/admin/luma-registrants", { credentials: "include" }));
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the guest list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadSync();
  }, [load, loadSync]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const csv = await file.text();
      const data = await readJson(
        await fetch("/api/admin/luma-registrants", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv }),
        }),
      );
      setResult(data);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const shown = items.filter((r) =>
    `${r.email} ${r.name ?? ""} ${r.lumaStatus ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase()),
  );
  const statusCounts = items.reduce<Record<string, number>>((acc, r) => {
    const key = r.lumaStatus ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Luma guest list</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Only emails on this list can sign in to the portal (staff and super admins excepted). Use{" "}
          <strong>Sync from Luma</strong> to read the guest list straight from the Luma API (read-only). As a fallback, in
          Luma open the event → Guests → Export CSV and upload it below. Both update existing rows by email and never
          delete anyone. At sign-in, an email that is not approved here is also checked live on Luma.
          Only guests with approval status <code>approved</code> (&ldquo;Going&rdquo; in Luma) can sign in; waitlist,
          pending, invited, declined and empty statuses are refused. Re-import after approving people on Luma.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-[var(--border-color)] bg-white/5 p-4" aria-label="Luma sync">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void syncNow()}
            disabled={syncing || syncConfigured === false}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync from Luma"}
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            {syncConfigured === false
              ? "Luma API not configured (LUMA_API_KEY missing): use the CSV import."
              : lastSync
                ? `Last synced ${formatRome(new Date(lastSync.at))} (Rome time)`
                : "Never synced."}
          </span>
        </div>
        {syncError ? (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {syncError}
          </div>
        ) : null}
        {lastSync ? (
          <div className="text-sm text-[var(--text-secondary)]">
            <p>
              {lastSync.fetched} guests read from Luma: {lastSync.inserted} new, {lastSync.existing} already listed,{" "}
              {lastSync.statusChanged} with a changed status ({lastSync.upgraded} newly approved, {lastSync.downgraded}{" "}
              no longer approved).
              {lastSync.missingFromLuma > 0
                ? ` ${lastSync.missingFromLuma} local rows are not on Luma's list (kept as they are).`
                : ""}
            </p>
            <p className="mt-2 flex flex-wrap gap-2">
              {Object.entries(lastSync.byStatus).map(([status, count]) => (
                <span key={status} className="rounded-full border border-[var(--border-color)] px-2 py-0.5">
                  {status}: {count}
                </span>
              ))}
            </p>
          </div>
        ) : null}
      </section>

      <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-color)] bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10">
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {uploading ? "Importing…" : "Upload Luma guest CSV"}
      </label>

      {result ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Imported {result.imported} of {result.totalRows} rows: {result.inserted} new, {result.updated} updated.
          {result.skippedRows.length > 0
            ? ` Skipped ${result.skippedRows.length} rows without a valid email (rows ${result.skippedRows.slice(0, 10).join(", ")}${result.skippedRows.length > 10 ? "…" : ""}).`
            : ""}
          {result.duplicateEmails > 0 ? ` ${result.duplicateEmails} duplicate emails (last row kept).` : ""}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
        <span>{items.length} guests</span>
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status} className="rounded-full border border-[var(--border-color)] px-2 py-0.5">
            {status}: {count}
          </span>
        ))}
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by email, name, status"
          className="ml-auto rounded-lg border border-[var(--border-color)] bg-black/40 px-3 py-1.5 text-white"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Luma status</th>
              <th className="px-3 py-2">Registered on Luma</th>
              <th className="px-3 py-2">Portal account</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-[var(--text-muted)]">
                  Loading…
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-[var(--text-muted)]">
                  No guests yet. Upload the Luma CSV.
                </td>
              </tr>
            ) : (
              shown.map((r) => (
                <tr key={r.email} className="border-t border-[var(--border-color)] text-white">
                  <td className="px-3 py-2">{r.name ?? "—"}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.lumaStatus ?? "—"}</td>
                  <td className="px-3 py-2">{r.lumaRegisteredAt ? formatRome(new Date(r.lumaRegisteredAt)) : "—"}</td>
                  <td className="px-3 py-2">{r.hasAccount ? "Yes" : "Not signed in yet"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
