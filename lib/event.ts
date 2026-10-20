/**
 * Single source of truth for the current event.
 *
 * Every public fact about the event (name, dates, venue, schedule, hosts,
 * registration link) lives here. Landing sections, metadata, Open Graph,
 * JSON-LD, sitemap and footer all read from this module, so the next event
 * only needs a new version of this file.
 *
 * Source: the Luma page (EVENT.registration.url). Do not add facts that are
 * not published there.
 */

export type Localized = { it: string; en: string };

export type ScheduleItem = {
  /** Local time in EVENT.timezone, "HH:MM". Omitted for open-ended blocks (e.g. overnight). */
  time?: string;
  /** Optional end time, "HH:MM". */
  endTime?: string;
  title: Localized;
  detail?: Localized;
};

export type ScheduleDay = {
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  items: ScheduleItem[];
};

export type HardwareItem = {
  id: "robot-dog" | "driving-sim" | "flight-sim" | "drones";
  name: Localized;
};

export type RegistrationStatus = "open" | "waitlist" | "closed";

export const EVENT = {
  name: "Grok Hackathon at the Museum",
  shortName: "Grok Hackathon",
  /** Name used on the printed flyer. */
  flyerName: "Grok Bot Hackathon",

  organizer: {
    name: "SpaceXAI for Milan, Italy",
    shortName: "SpaceXAI",
  },

  hosts: ["Luca Bianchi", "Federico Pellegrini", "Marco D'Angelo"],

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
  },

  venue: {
    name: "Ctrl+Alt Museum",
    url: "https://ctrlalt.museum",
    operator: "comPVter",
    description: {
      it: "Museo di retrocomputing gestito da comPVter, un'associazione no profit.",
      en: "A retro computing museum run by comPVter, a nonprofit.",
    } satisfies Localized,
    address: {
      streetAddress: "Via Riviera, 39",
      postalCode: "27100",
      locality: "Pavia",
      region: "PV",
      country: "IT",
      countryName: { it: "Italia", en: "Italy" } satisfies Localized,
    },
    gettingThere: [
      {
        it: "A 200 m dalla stazione di Pavia.",
        en: "200 m from Pavia train station.",
      },
      {
        it: "Circa 25 minuti di treno da Milano Rogoredo.",
        en: "About 25 minutes by train from Milano Rogoredo.",
      },
    ] satisfies Localized[],
    /** Museum stays open to participants through Wednesday night. */
    openOvernight: true,
  },

  intro: {
    author: "Luca Bianchi",
    text: {
      it: "Alcuni di voi c'erano alle serate Café Cursor a Milano. Questa è un po' diversa.",
      en: "Some of you were at the Café Cursor evenings in Milano. This one is a bit different.",
    } satisfies Localized,
  },

  brief: {
    it: "Scegli un pezzo di hardware e un'API, collegali a Grok (l'API, Grok Voice o il framework per i bot) e entro giovedì pomeriggio mostra qualcosa che quando hai iniziato non funzionava.",
    en: "Pick a piece of hardware, an API, connect it to Grok (the API, Grok Voice, or the bot framework), and by Thursday afternoon show something that didn't work when you started.",
  } satisfies Localized,

  grokSurfaces: ["Grok API", "Grok Voice", "Grok Bots"],

  hardware: [
    { id: "robot-dog", name: { it: "Un cane robot", en: "A robotic dog" } },
    { id: "driving-sim", name: { it: "Un simulatore di guida", en: "A driving simulator" } },
    { id: "flight-sim", name: { it: "Un simulatore di volo", en: "A flight simulator" } },
    { id: "drones", name: { it: "Alcuni droni", en: "A few drones" } },
  ] satisfies HardwareItem[],

  hardwareNote: {
    it: "Accesso vero, non una demo dietro un cordone. Lo staff del museo si occupa della parte hardware e dà una mano a chi costruisce.",
    en: "Real access, not a demo behind a rope. Museum staff handle the hardware side and support builders.",
  } satisfies Localized,

  speaker: {
    name: "Nick Miller",
    affiliation: "SpaceXAI",
    role: { it: "Team SpaceXAI", en: "SpaceXAI team" } satisfies Localized,
    bio: {
      it: "Arriva giovedì: apre la giornata con un talk sui modelli e sull'API, poi resta ai tavoli con chi costruisce.",
      en: "Joins on Thursday: opens the day with a talk on the models and the API, then stays with builders at the tables.",
    } satisfies Localized,
  },

  schedule: [
    {
      date: "2026-11-04",
      items: [
        {
          time: "09:00",
          title: { it: "Kick-off", en: "Kick-off" },
          detail: {
            it: "Tour dell'hardware, formazione dei team, si inizia a costruire.",
            en: "Hardware tour, find a team, start building.",
          },
        },
        {
          time: "18:00",
          title: { it: "Presentazione Ctrl+Alt Ecosystem", en: "Ctrl+Alt Ecosystem presentation" },
        },
        {
          title: { it: "Si continua tutta la notte", en: "Hacking continues through the night" },
          detail: {
            it: "Il museo resta aperto per i partecipanti.",
            en: "The museum stays open to participants.",
          },
        },
      ],
    },
    {
      date: "2026-11-05",
      items: [
        {
          time: "09:00",
          title: { it: "Talk di Nick Miller (SpaceXAI)", en: "Talk by Nick Miller (SpaceXAI)" },
          detail: {
            it: "Modelli Grok, API, Grok Voice, Grok Bots.",
            en: "Grok models, API, Grok Voice, Grok Bots.",
          },
        },
        {
          time: "09:00",
          endTime: "16:00",
          title: { it: "Si costruisce, con Nick ai tavoli", en: "Build, with Nick at the tables" },
        },
        {
          time: "16:00",
          endTime: "19:00",
          title: { it: "Valutazione dei progetti e pitch", en: "Project evaluation and pitches" },
        },
        {
          time: "21:00",
          title: { it: "Premiazione", en: "Awards ceremony" },
        },
      ],
    },
  ] satisfies ScheduleDay[],

  practical: [
    { it: "Team da 1 a 4 persone.", en: "Teams of 1 to 4." },
    { it: "Porta il tuo laptop.", en: "Bring your laptop." },
    { it: "Crediti API inclusi.", en: "API credits provided." },
    { it: "Massimo 100 partecipanti.", en: "Capacity capped at 100." },
    {
      it: "Iscrizione su Luma con approvazione.",
      en: "Registration on Luma, by approval.",
    },
  ] satisfies Localized[],

  followUp: {
    name: "Startup Weekend Milano–Pavia",
    startDate: "2026-11-06",
    endDate: "2026-11-08",
    text: {
      it: "Startup Weekend Milano–Pavia parte la mattina dopo la premiazione (6 novembre) e va avanti fino all'8 novembre. Si possono fare entrambi.",
      en: "Startup Weekend Milano–Pavia starts the morning after the awards (November 6) and runs through November 8. You can do both.",
    } satisfies Localized,
  },

  /** Bump when the public content changes; used as sitemap lastModified. */
  contentUpdatedAt: "2026-10-20",
} as const;

export type EventConfig = typeof EVENT;

/** Single-line postal address, e.g. "Via Riviera, 39, 27100 Pavia PV, Italy". */
export function formatAddress(lang: keyof Localized = "en"): string {
  const a = EVENT.venue.address;
  return `${a.streetAddress}, ${a.postalCode} ${a.locality} ${a.region}, ${a.countryName[lang]}`;
}

/** Google Maps search link for the venue. */
export function getMapsUrl(): string {
  const query = `${EVENT.venue.name}, ${formatAddress("en")}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const LOCALE_TAG: Record<keyof Localized, string> = { it: "it-IT", en: "en-GB" };

/** "4–5 novembre 2026" / "4–5 November 2026", computed in the event time zone. */
export function formatDateRange(lang: keyof Localized): string {
  const start = new Date(EVENT.startDate);
  const end = new Date(EVENT.endDate);
  const tz = EVENT.timezone;
  const day = (d: Date) =>
    new Intl.DateTimeFormat(LOCALE_TAG[lang], { day: "numeric", timeZone: tz }).format(d);
  const monthYear = new Intl.DateTimeFormat(LOCALE_TAG[lang], {
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(end);
  return `${day(start)}–${day(end)} ${monthYear}`;
}

/** "mercoledì 4 novembre" / "Wednesday 4 November" for a local "YYYY-MM-DD". */
export function formatDayLabel(date: string, lang: keyof Localized): string {
  // Noon UTC keeps the calendar day stable in any zone within ±11h.
  const d = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat(LOCALE_TAG[lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(d);
}

/** Description used for metadata and JSON-LD. */
export const EVENT_DESCRIPTION: Localized = {
  it: `Hackathon di due giorni al ${EVENT.venue.name} di Pavia: hardware vero (cane robot, simulatori di guida e di volo, droni) collegato a Grok. ${formatDateRange("it")}.`,
  en: `Two-day hackathon at the ${EVENT.venue.name} in Pavia: real hardware (a robotic dog, driving and flight simulators, drones) connected to Grok. ${formatDateRange("en")}.`,
};
