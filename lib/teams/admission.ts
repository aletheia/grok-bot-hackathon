/**
 * Seat allocation after the team lock (pure, unit-tested).
 *
 * - Formed teams (>= minMembers) get guaranteed seats for all members.
 * - Everyone else who may attend is queued first-come, first-served.
 *   Order key: Luma registration time (CSV `created_at`), then portal account
 *   creation time, then import time; ties broken by email.
 * - The first `capacity - guaranteed` people in the queue are admitted.
 */
export type AdmissionTeam = {
  id: number;
  name: string;
  members: { userId: string; name: string; email: string }[];
};

export type AdmissionCandidate = {
  email: string;
  name: string | null;
  userId: string | null;
  teamId: number | null;
  teamName: string | null;
  teamSize: number;
  availableForTeam: boolean;
  lumaRegisteredAt: Date | null;
  accountCreatedAt: Date | null;
  importedAt: Date | null;
};

export type QueueEntry = AdmissionCandidate & {
  position: number;
  orderedBy: "luma_registration" | "portal_account" | "import" | "none";
  orderAt: Date | null;
  admitted: boolean;
};

export type AdmissionResult = {
  capacity: number;
  formedTeams: (AdmissionTeam & { size: number })[];
  guaranteedSeats: number;
  remainingSeats: number;
  queue: QueueEntry[];
  admittedFromQueue: number;
};

function orderKey(c: AdmissionCandidate): Pick<QueueEntry, "orderedBy" | "orderAt"> {
  if (c.lumaRegisteredAt) return { orderedBy: "luma_registration", orderAt: c.lumaRegisteredAt };
  if (c.accountCreatedAt) return { orderedBy: "portal_account", orderAt: c.accountCreatedAt };
  if (c.importedAt) return { orderedBy: "import", orderAt: c.importedAt };
  return { orderedBy: "none", orderAt: null };
}

export function orderQueue(candidates: readonly AdmissionCandidate[]) {
  return candidates
    .map((c) => ({ ...c, ...orderKey(c) }))
    .sort((a, b) => {
      const ta = a.orderAt ? a.orderAt.getTime() : Number.POSITIVE_INFINITY;
      const tb = b.orderAt ? b.orderAt.getTime() : Number.POSITIVE_INFINITY;
      return ta - tb || a.email.localeCompare(b.email);
    });
}

export function computeAdmission(input: {
  capacity: number;
  minMembers: number;
  teams: readonly AdmissionTeam[];
  candidates: readonly AdmissionCandidate[];
}): AdmissionResult {
  const formedTeams = input.teams
    .filter((t) => t.members.length >= input.minMembers)
    .map((t) => ({ ...t, size: t.members.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const formedUserIds = new Set(formedTeams.flatMap((t) => t.members.map((m) => m.userId)));
  const formedEmails = new Set(formedTeams.flatMap((t) => t.members.map((m) => m.email.toLowerCase())));
  const guaranteedSeats = formedTeams.reduce((sum, t) => sum + t.size, 0);
  const remainingSeats = Math.max(0, input.capacity - guaranteedSeats);

  const queue = orderQueue(
    input.candidates.filter(
      (c) => !(c.userId && formedUserIds.has(c.userId)) && !formedEmails.has(c.email.toLowerCase()),
    ),
  ).map((c, i) => ({ ...c, position: i + 1, admitted: i < remainingSeats }));

  return {
    capacity: input.capacity,
    formedTeams,
    guaranteedSeats,
    remainingSeats,
    queue,
    admittedFromQueue: Math.min(remainingSeats, queue.length),
  };
}
