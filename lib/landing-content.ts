import type { JuryMember, Prize, Sponsor, SponsorTier } from "@/lib/event";

/**
 * Pure helpers that turn the (possibly empty) prize / jury / sponsor config in
 * lib/event.ts into what the landing renders: real entries where they exist,
 * labelled placeholders everywhere else. Placeholders never carry invented data.
 */

const filled = (value: string | null | undefined): value is string => typeof value === "string" && value.trim().length > 0;

export type PodiumSlot = { place: 1 | 2 | 3; prize: Prize | null };

/** Always three podium slots (1st, 2nd, 3rd); a slot without a named prize is `null` (placeholder). */
export function getPodium(prizes: readonly Prize[]): PodiumSlot[] {
  return ([1, 2, 3] as const).map((place) => {
    const prize = prizes.find((p) => p.place === place && (filled(p.title) || filled(p.reward)));
    return { place, prize: prize ?? null };
  });
}

/** Prizes without a podium place and with a title: the "Special and track prizes" list. */
export function getSpecialPrizes(prizes: readonly Prize[]): Prize[] {
  return prizes.filter((p) => p.place === undefined && filled(p.title));
}

/** Named jurors, or `slots` placeholders (`null`) while none are named. */
export function getJurySlots(jury: readonly JuryMember[], slots: number): (JuryMember | null)[] {
  const named = jury.map((j) => (filled(j.name) ? j : null));
  if (named.length > 0) return named;
  return Array.from({ length: Math.max(0, slots) }, () => null);
}

export type RenderedTier = Omit<SponsorTier, "sponsors"> & { items: (Sponsor | null)[] };

/** Tiers ready to render: named sponsors, placeholders for unnamed ones; empty tiers get `placeholderSlots` placeholders or are dropped. */
export function getSponsorTiers(tiers: readonly SponsorTier[]): RenderedTier[] {
  return tiers
    .map(({ sponsors, ...tier }) => {
      const items = sponsors.length > 0 ? sponsors.map((s) => (filled(s.name) ? s : null)) : Array.from({ length: Math.max(0, tier.placeholderSlots) }, () => null);
      return { ...tier, items };
    })
    .filter((tier) => tier.items.length > 0);
}

/** Named sponsors and partners (not the organizer, never placeholders) for schema.org `sponsor`. */
export function getJsonLdSponsors(tiers: readonly SponsorTier[]): { "@type": "Organization"; name: string; url?: string }[] {
  return tiers
    .filter((tier) => tier.kind !== "organizer")
    .flatMap((tier) => tier.sponsors)
    .filter((s): s is Sponsor & { name: string } => filled(s.name))
    .map((s) => ({ "@type": "Organization" as const, name: s.name.trim(), ...(filled(s.url) ? { url: s.url } : {}) }));
}

/** "Become a sponsor" target: email first, then URL; `null` when no contact is configured. */
export function getSponsorContactHref(contact: { email: string | null; url: string | null }): string | null {
  if (filled(contact.email)) return `mailto:${contact.email.trim()}`;
  if (filled(contact.url)) return contact.url.trim();
  return null;
}
