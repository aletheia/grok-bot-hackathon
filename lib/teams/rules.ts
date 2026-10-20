import { EVENT } from "@/lib/event";
import { formatRome } from "@/lib/time/rome";

export const TEAM_LOCK_AT = new Date(EVENT.portal.teamLockAt);

/** "31 October 2026 at 23:59 (Rome time)" */
export function formatTeamLock(): string {
  const date = formatRome(TEAM_LOCK_AT, { month: "long", hour: undefined, minute: undefined });
  const time = formatRome(TEAM_LOCK_AT, { day: undefined, month: undefined, year: undefined });
  return `${date} at ${time} (Rome time)`;
}

export type TeamRule = { title: string; body: string };

/** The team rules, in order. Shown on the landing, on /rules and next to the team screens. */
export function getTeamRules(): TeamRule[] {
  const { minMembers, maxMembers } = EVENT.portal.team;
  const capacity = EVENT.registration.capacity;
  return [
    {
      title: "Sign in with your Luma email",
      body: `Use the same email you used to register on ${EVENT.registration.provider}. Only guests the organisers have approved on Luma can sign in (not waitlist or pending); we send a one-time code to that address.`,
    },
    {
      title: "Create, join or say you're available",
      body: "Create a team and get its secret code, join a team with the code a teammate shares with you, or mark yourself as available so teams looking for people can find you.",
    },
    {
      title: `Teams of ${minMembers} to ${maxMembers}`,
      body: `A team needs at least ${minMembers} people to count as formed. At ${maxMembers} members it closes automatically and the code stops working; if someone leaves, it opens again.`,
    },
    {
      title: "One team at a time, and you can leave",
      body: "You can be in one team only. You can leave whenever you want before the lock. If the person who created the team leaves, the earliest-joined member takes over; a team with nobody left is removed.",
    },
    {
      title: `Teams lock on ${formatTeamLock()}`,
      body: "After that moment nobody can create, join or leave a team. Sort out your team before then.",
    },
    {
      title: `Guaranteed seats for teams of ${minMembers}+`,
      body: `When teams lock, every member of a team with ${minMembers} or more people has a guaranteed seat. Everyone else (smaller teams, solo, available) gets the remaining seats, up to ${capacity} in total, first come, first served by Luma registration time.`,
    },
  ];
}
