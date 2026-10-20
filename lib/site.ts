import { EVENT, EVENT_DESCRIPTION } from "@/lib/event";

/**
 * Canonical site URL for metadata, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://your-domain.example).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}

/** Site-level branding, derived from the event config (lib/event.ts). */
export const siteConfig = {
  name: EVENT.name,
  shortName: EVENT.shortName,
  tagline: `${EVENT.venue.name}, ${EVENT.venue.address.locality}`,
  /** Primary description for metadata. */
  description: EVENT_DESCRIPTION,
  descriptionEn: EVENT_DESCRIPTION,
  locale: "en_US",
  alternateLocales: [] as string[],
  twitterHandle: undefined as string | undefined,
} as const;
