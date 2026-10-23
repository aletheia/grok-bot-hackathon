import type { JuryMember } from "@/lib/event";

/**
 * Pure helpers for the Jury cards: initials avatar, accent colour, bio clamp / "Read more" rule, photo alt text.
 * No juror data lives here (that is EVENT.jury in lib/event.ts).
 */

/** Lower-case surname particles that belong to the surname and are skipped for initials ("Anna de Luca" -> "AL"). */
const PARTICLES = new Set([
  "de", "di", "da", "del", "della", "dello", "dei", "degli", "delle", "d", "van", "von", "der", "den", "ten", "ter",
  "la", "le", "du", "dos", "das", "do", "el", "al", "bin", "ben", "y",
]);

const stripMarks = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "");

/** Words of a name, trimmed of punctuation, keeping inner hyphen parts as separate words ("Jean-Luc" -> Jean, Luc). */
function nameWords(name: string): string[] {
  return stripMarks(name)
    .split(/[\s\-–—]+/u)
    .map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""))
    .filter((w) => w.length > 0);
}

/**
 * Two-letter initials: first letter of the first name and of the last name ("Lorenzo Cerri" -> "LC").
 * Accents are dropped ("Élodie Brûlé" -> "EB"); surname particles are skipped ("Anna De Luca" -> "AL",
 * "Ludwig van Beethoven" -> "LB"); a single name gives its first two letters ("Madonna" -> "MA").
 * Returns "" when the name has no letters.
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const words = nameWords(name);
  if (words.length === 0) return "";
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  const first = words[0];
  const rest = words.slice(1);
  let last = rest[rest.length - 1];
  // Last word is a particle only if the whole tail is particles ("Maria De"): keep the real last word then.
  const significant = rest.filter((w) => !PARTICLES.has(w.toLowerCase()));
  if (significant.length > 0) last = significant[significant.length - 1];
  return (Array.from(first)[0] + Array.from(last)[0]).toUpperCase();
}

/**
 * Accent palette (the site's blob colours, see app/globals.css) with a near-black label colour: every pair
 * is at least WCAG AA for normal text (checked in lib/jury.test.ts).
 */
export const JUROR_ACCENTS = [
  { name: "pink", bg: "#ff3fa4", fg: "#0a0a0a" },
  { name: "orange", bg: "#ff8c1a", fg: "#0a0a0a" },
  { name: "teal", bg: "#17b8a6", fg: "#0a0a0a" },
  { name: "blue", bg: "#6fa8ff", fg: "#0a0a0a" },
] as const;

export type JurorAccent = (typeof JUROR_ACCENTS)[number];

/** Deterministic accent per juror (FNV-1a hash of the name), so it never changes when the list is reordered. */
export function getJurorAccent(name: string): JurorAccent {
  let h = 0x811c9dc5;
  for (const ch of name.trim().toLowerCase()) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return JUROR_ACCENTS[h % JUROR_ACCENTS.length];
}

/** Alt text for a juror photo. */
export const getPhotoAlt = (name: string) => `Portrait of ${name.trim()}`;

/** Without a `bioShort`, a bio longer than this is treated as not fitting the two-line card. */
export const BIO_CLAMP_CHARS = 80;

export type JurorBio = {
  /** Text shown in the card (clamped to two lines with CSS), or null. */
  short: string | null;
  /** Full text shown in the "Read more" dialog, or null when there is nothing more to show. */
  full: string | null;
};

const clean = (s: string | null | undefined) => (typeof s === "string" && s.trim().length > 0 ? s.trim() : null);

/**
 * Card text is `bioShort` (or `bio` when there is no short version). The full bio is returned, and so the
 * "Read more" control shown, only when it is longer than the text on the card; without `bioShort` that means
 * longer than BIO_CLAMP_CHARS, which is what fits in two lines.
 */
export function getJurorBio(juror: Pick<JuryMember, "bio" | "bioShort">): JurorBio {
  const bio = clean(juror.bio);
  const bioShort = clean(juror.bioShort);
  const short = bioShort ?? bio;
  if (!short) return { short: null, full: null };
  const full = bio !== null && bio.length > (bioShort ? bioShort.length : BIO_CLAMP_CHARS) ? bio : null;
  return { short, full };
}
