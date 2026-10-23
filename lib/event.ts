import { TRACKS_CONTENT } from "@/lib/tracks";

/**
 * Single source of truth for the current event.
 *
 * Every public fact about the event (name, dates, venue, schedule, hosts,
 * registration link, team rules) lives here. Landing sections, metadata,
 * Open Graph, JSON-LD, sitemap, footer and the portal's team rules read from
 * this module.
 *
 * Source: the Luma page (EVENT.registration.url). Do not add facts that are
 * not published there. Values set to `null` / `[]` render as clearly labelled
 * placeholders or "To be announced" states until real content is provided.
 */

export type ScheduleItem = {
  /** Local time in EVENT.timezone, "HH:MM". Omitted for open-ended blocks (e.g. overnight). */
  time?: string;
  /** Optional end time, "HH:MM". */
  endTime?: string;
  title: string;
  detail?: string;
};

export type ScheduleDay = {
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  items: ScheduleItem[];
};

export type HardwareItem = {
  id: "robot-dog" | "driving-sim" | "flight-sim" | "drones";
  name: string;
};

export type RegistrationStatus = "open" | "waitlist" | "closed";

/** Image asset: path under /public (e.g. "/assets/logos/spacexai.svg") or absolute URL. `null` = placeholder. */
export type AssetSrc = string | null;

export type Criterion = { title: string; description?: string; weight?: string };

/**
 * A prize. `place` 1–3 puts it on the podium; leave `place` out for special or track prizes.
 * `title: null` (or a missing podium place) renders a "Prize to be announced" card.
 */
export type Prize = {
  place?: 1 | 2 | 3;
  /** e.g. "Best use of Grok Voice". For podium prizes the place label is shown anyway. */
  title: string | null;
  /** What the winners get, exactly as announced (e.g. an amount or an item). `null` = to be announced. */
  reward?: string | null;
  description?: string | null;
  /** Optional track the prize belongs to (should match a title in EVENT.tracks). */
  track?: string | null;
};

/** A juror. `name: null` renders a labelled placeholder card. */
export type JuryMember = {
  name: string | null;
  role?: string | null;
  org?: string | null;
  /** Square photo under /public (e.g. "/assets/jury/jane-doe.jpg") or absolute URL. */
  photo?: AssetSrc;
  /** One or two sentences. */
  bio?: string | null;
  /** Optional profile link (LinkedIn, personal site…). */
  link?: string | null;
};

/** A sponsor or partner. `name: null` renders a "Sponsor logo" placeholder. */
export type Sponsor = {
  name: string | null;
  /** Logo under /public (e.g. "/assets/sponsors/acme.svg") or absolute URL. `null` = labelled placeholder with the name. */
  logo?: AssetSrc;
  /** Intrinsic pixel size of the logo file (used by next/image to reserve space). Defaults to 400x160 for a placeholder-sized box. */
  logoWidth?: number;
  logoHeight?: number;
  /** Alt text override; defaults to "<name> logo". */
  logoAlt?: string;
  url?: string | null;
};

/** Logos Luca will provide. Put files in /public/assets/… and set the path, or use an absolute URL. `null` = labelled placeholder. */
const LOGOS = {
  spacexai: null as AssetSrc,
  ctrlAltMuseum: null as AssetSrc,
  compvter: null as AssetSrc,
  startupWeekend: null as AssetSrc,
};

export const EVENT = {
  name: "Grok Hackathon at the Museum",
  shortName: "Grok Hackathon",
  /** Name used on the printed flyer. */
  flyerName: "Grok Bot Hackathon",

  organizer: {
    name: "SpaceXAI for Milan, Italy",
    shortName: "SpaceXAI",
  },

  hosts: [
    { name: "Luca Bianchi", photo: null as AssetSrc },
    { name: "Federico Pellegrini", photo: null as AssetSrc },
    { name: "Marco D'Angelo", photo: null as AssetSrc },
  ],

  /** IANA zone for every local time in this file. */
  timezone: "Europe/Rome",
  /** ISO 8601 with the Europe/Rome offset in force on those dates (CET, +01:00). */
  startDate: "2026-11-04T09:00:00+01:00",
  endDate: "2026-11-05T22:30:00+01:00",

  registration: {
    url: "https://luma.com/spacexai-z1ys",
    provider: "Luma",
    status: "waitlist" as RegistrationStatus,
    approvalRequired: true,
    capacity: 100,
    /**
     * Team registration window (Europe/Rome, CET: DST ended 25 Oct). The banner on the landing, /rules,
     * /register and the dashboard derives "opens on / open until / closed" from these two instants.
     * Closes at the end of the day (23:59). Note: the team lock (portal.teamLockAt) is a day later.
     */
    registrationOpens: "2026-10-26T00:00:00+01:00",
    registrationCloses: "2026-10-30T23:59:00+01:00",
  },

  /**
   * Logos and links Luca will provide. Put files in /public/assets/… and set the path,
   * or use an absolute URL. `null` renders a labelled placeholder.
   */
  assets: {
    logos: LOGOS,
  },

  venue: {
    name: "Ctrl+Alt Museum",
    url: "https://ctrlalt.museum",
    operator: "comPVter",
    description: "A retro computing museum run by comPVter, a nonprofit.",
    address: {
      streetAddress: "Via Riviera, 39",
      postalCode: "27100",
      locality: "Pavia",
      region: "PV",
      country: "IT",
      countryName: "Italy",
    },
    gettingThere: [
      "200 m from Pavia train station.",
      "About 25 minutes by train from Milano Rogoredo.",
    ],
    /** Museum stays open to participants through Wednesday night. */
    openOvernight: true,
  },

  intro: {
    author: "Luca Bianchi",
    text: "Some of you were at the Café Cursor evenings in Milano. This one is a bit different.",
  },

  brief:
    "Pick a piece of hardware, an API, connect it to Grok (the API, Grok Voice, or the bot framework), and by Thursday afternoon show something that didn't work when you started.",

  grokSurfaces: ["Grok API", "Grok Voice", "Grok Bots"],

  hardware: [
    { id: "robot-dog", name: "A robotic dog" },
    { id: "driving-sim", name: "A driving simulator" },
    { id: "flight-sim", name: "A flight simulator" },
    { id: "drones", name: "A few drones" },
  ] satisfies HardwareItem[],

  hardwareNote:
    "Real access, not a demo behind a rope. Museum staff handle the hardware side and support builders.",

  speaker: {
    name: "Nick Miller",
    affiliation: "SpaceXAI",
    role: "SpaceXAI team",
    photo: null as AssetSrc,
    bio: "Joins on Thursday: opens the day with a talk on the models and the API, then stays with builders at the tables.",
  },

  /** To be published. Empty arrays render a "To be announced" state. */
  /** Proposed tracks (landing recap + /tracks). Content lives in lib/tracks.ts. */
  tracks: TRACKS_CONTENT,
  criteria: [] as Criterion[],

  /**
   * PRIZES (landing #prizes). Add one entry per prize, e.g.
   *   { place: 1, title: "Best overall", reward: "<as announced>", description: "…" }
   *   { title: "Best use of Grok Voice", reward: "<as announced>", track: "<track title>" }
   * Podium places 1–3 without an entry show "Prize to be announced". Entries without
   * `place` appear in the "Special and track prizes" list (hidden while there are none).
   */
  prizes: [] as Prize[],

  /**
   * JURY (landing #jury). Add one entry per juror:
   *   { name: "…", role: "…", org: "…", photo: "/assets/jury/<file>.jpg", bio: "…", link: "https://…" }
   * While the list is empty, `juryPlaceholderSlots` placeholder cards are shown.
   * The evaluation criteria card (EVENT.criteria above) sits next to the jury.
   */
  jury: [] as JuryMember[],
  juryPlaceholderSlots: 3,

  /**
   * SPONSORS (landing #sponsors). One flat list: every logo gets an identical tile, no tiers.
   * Add an entry per sponsor:
   *   { name: "…", logo: "/assets/sponsors/<file>.png", logoWidth: 800, logoHeight: 200, url: "https://…" }
   * (logoWidth/logoHeight = the file's pixel size; white-on-transparent logos are fine, tiles are dark;
   * `url` is optional and makes the tile a link.) Named sponsors are also added to the event JSON-LD.
   * While `list` is empty, `placeholderSlots` "Sponsor logo" boxes are shown.
   */
  sponsors: {
    /** Shown in the "Organized by" row above the grid (not repeated in JSON-LD sponsors). */
    organizer: { name: "SpaceXAI", logo: LOGOS.spacexai, url: null } as Sponsor,
    placeholderSlots: 6,
    list: [
      { name: "Ctrl+Alt Museum", logo: "/assets/sponsors/ctrl-alt-museum.png", logoWidth: 274, logoHeight: 400 },
      { name: "Radixia", logo: "/assets/sponsors/radixia.png", logoWidth: 800, logoHeight: 138 },
      { name: "Pavia – Open your mind", logo: "/assets/sponsors/pavia-open-your-mind.png", logoWidth: 800, logoHeight: 357 },
      { name: "SICAM", logo: "/assets/sponsors/sicam.png", logoWidth: 456, logoHeight: 400 },
      { name: "Riso Scotti", logo: "/assets/sponsors/riso-scotti.png", logoWidth: 651, logoHeight: 400 },
      { name: "Coherency", logo: "/assets/sponsors/coherency.png", logoWidth: 523, logoHeight: 400 },
    ] as Sponsor[],
    /**
     * "Become a sponsor" contact. TODO(Luca): set a real email and/or page URL.
     * While both are null the CTA says the contact is to be announced (no invented address).
     */
    contact: {
      email: null as string | null,
      url: null as string | null,
    },
  },

  schedule: [
    {
      date: "2026-11-04",
      items: [
        { time: "09:00", title: "Kick-off", detail: "Hardware tour, find a team, start building." },
        { time: "18:00", title: "Ctrl+Alt Ecosystem presentation" },
        { title: "Hacking continues through the night", detail: "The museum stays open to participants." },
      ],
    },
    {
      date: "2026-11-05",
      items: [
        { time: "09:00", title: "Talk by Nick Miller (SpaceXAI)", detail: "Grok models, API, Grok Voice, Grok Bots." },
        { time: "09:00", endTime: "16:00", title: "Build, with Nick at the tables" },
        { time: "16:00", endTime: "19:00", title: "Project evaluation and pitches" },
        { time: "21:00", title: "Awards ceremony" },
      ],
    },
  ] satisfies ScheduleDay[],

  practical: [
    "Teams of 4 to 6 (see how teams work below).",
    "Bring your laptop.",
    "API credits provided.",
    "Capacity capped at 100.",
    "Registration on Luma, by approval.",
  ],

  followUp: {
    name: "Startup Weekend Milano–Pavia",
    startDate: "2026-11-06",
    endDate: "2026-11-08",
    /** Link to be provided. `null` renders a placeholder. */
    url: null as string | null,
    text: "Startup Weekend Milano–Pavia starts the morning after the awards (November 6) and runs through November 8. You can do both.",
  },

  /** Participant portal (team formation) rules. */
  portal: {
    team: {
      minMembers: 4,
      maxMembers: 6,
    },
    /** Team lock: no create/join/leave after this instant (Europe/Rome, CET after DST ends 25 Oct). */
    teamLockAt: "2026-10-31T23:59:00+01:00",
    /**
     * Luma `approval_status` values that MAY sign in (compared after normalising: trim,
     * lower-case, spaces/hyphens -> "_"). Only confirmed guests: Luma's API/CSV value is
     * `approved`; "going" is Luma's UI label for the same status. Everything else
     * (waitlist, pending_approval, invited, declined, empty) is refused.
     */
    approvedLumaStatuses: ["approved", "going"] as string[],
  },

  /** Bump when the public content changes; used as sitemap lastModified. */
  contentUpdatedAt: "2026-10-20",
} as const;

export type EventConfig = typeof EVENT;

/** Single-line postal address, e.g. "Via Riviera, 39, 27100 Pavia PV, Italy". */
export function formatAddress(): string {
  const a = EVENT.venue.address;
  return `${a.streetAddress}, ${a.postalCode} ${a.locality} ${a.region}, ${a.countryName}`;
}

/** Google Maps search link for the venue. */
export function getMapsUrl(): string {
  const query = `${EVENT.venue.name}, ${formatAddress()}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const LOCALE = "en-GB";

/** "4–5 November 2026", computed in the event time zone. */
export function formatDateRange(): string {
  const start = new Date(EVENT.startDate);
  const end = new Date(EVENT.endDate);
  const tz = EVENT.timezone;
  const day = (d: Date) => new Intl.DateTimeFormat(LOCALE, { day: "numeric", timeZone: tz }).format(d);
  const monthYear = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: tz }).format(end);
  return `${day(start)}–${day(end)} ${monthYear}`;
}

/** "Wednesday 4 November" for a local "YYYY-MM-DD". */
export function formatDayLabel(date: string): string {
  // Noon UTC keeps the calendar day stable in any zone within ±11h.
  const d = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(d);
}

/** Description used for metadata and JSON-LD. */
export const EVENT_DESCRIPTION = `Two-day hackathon at the ${EVENT.venue.name} in Pavia: real hardware (a robotic dog, driving and flight simulators, drones) connected to Grok. ${formatDateRange()}.`;
