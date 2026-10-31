import { EVENT } from "@/lib/event";
import { formatRome } from "@/lib/time/rome";

export const TEAM_LOCK_AT = new Date(EVENT.portal.teamLockAt);

/** "2 November 2026 at 23:59 (Rome time)" */
export function formatTeamLock(): string {
  const date = formatRome(TEAM_LOCK_AT, { month: "long", hour: undefined, minute: undefined });
  const time = formatRome(TEAM_LOCK_AT, { day: undefined, month: undefined, year: undefined });
  return `${date} at ${time} (Rome time)`;
}

export type TeamRule = { title: string; body: string };

/** The three ways to take part, in the order they appear on the landing, on /rules and in the portal. */
export function getTeamPaths(): TeamRule[] {
  const { minMembers, maxMembers } = EVENT.portal.team;
  return [
    {
      title: "Register a team",
      body: `Sign in, create your team (name and a short description) and you immediately get its secret code. It stays visible to every member on your dashboard. Share it with the people you want: a team has ${minMembers} to ${maxMembers} members.`,
    },
    {
      title: "Join a team",
      body: "Got a code from a teammate? Sign in, choose Join a team and enter it. If the code is wrong, no longer active, or the team is full, you get a clear message.",
    },
    {
      title: "I'm looking for a team",
      body: "On your own? Mark yourself as looking for a team and add how to reach you. Teams with room can see your name, profile and note, and send you their code.",
    },
  ];
}

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
      title: "Register a team, join one, or look for one",
      body: "Register a team and get its secret code, join a team by entering the code a teammate shares with you, or register as looking for a team so teams with room can find you. Registering a team gives priority for participation confirmation.",
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
      body: "This is also the end of registration. After that moment nobody can register, join or leave a team. Sort out your team before then.",
    },
    {
      title: `Guaranteed seats for teams of ${minMembers}+`,
      body: `When teams lock, every member of a team with ${minMembers} or more people has a guaranteed seat. Everyone else (smaller teams, solo, available) gets the remaining seats, up to ${capacity} in total, first come, first served by Luma registration time.`,
    },
  ];
}
