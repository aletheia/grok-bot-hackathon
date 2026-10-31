import type { JuryMember, Sponsor } from "@/lib/event";

/**
 * Pure helpers that turn the (possibly empty) jury / sponsor config in
 * lib/event.ts into what the landing renders: real entries where they exist,
 * labelled placeholders everywhere else. Placeholders never carry invented data.
 */

const filled = (value: string | null | undefined): value is string => typeof value === "string" && value.trim().length > 0;

/** Named jurors, or `slots` placeholders (`null`) while none are named. */
export function getJurySlots(jury: readonly JuryMember[], slots: number): (JuryMember | null)[] {
  const named = jury.map((j) => (filled(j.name) ? j : null));
  if (named.length > 0) return named;
  return Array.from({ length: Math.max(0, slots) }, () => null);
}

/** Sponsors to render in the flat grid: named ones, or `slots` placeholders (`null`) while none are named. */
export function getSponsorItems(list: readonly Sponsor[], slots: number): (Sponsor | null)[] {
  const named = list.filter((s) => filled(s.name));
  if (named.length > 0) return named;
  return Array.from({ length: Math.max(0, slots) }, () => null);
}

/** Named sponsors (never the organizer or placeholders) for schema.org `sponsor`. */
export function getJsonLdSponsors(list: readonly Sponsor[]): { "@type": "Organization"; name: string; url?: string }[] {
  return list
    .filter((s): s is Sponsor & { name: string } => filled(s.name))
    .map((s) => ({ "@type": "Organization" as const, name: s.name.trim(), ...(filled(s.url) ? { url: s.url.trim() } : {}) }));
}

/** "Become a sponsor" target: email first, then URL; `null` when no contact is configured. */
export function getSponsorContactHref(contact: { email: string | null; url: string | null }): string | null {
  if (filled(contact.email)) return `mailto:${contact.email.trim()}`;
  if (filled(contact.url)) return contact.url.trim();
  return null;
}
