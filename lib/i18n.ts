/**
 * UI strings. Event facts (dates, venue, schedule, hosts…) live in lib/event.ts;
 * this file holds the interface copy around them.
 *
 * Italian is the default locale, English the second one. To add a locale,
 * extend LANGUAGES and add the key to every entry (missing keys fall back to English).
 */
export const LANGUAGES = ["it", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "it";

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

type Entry = { it: string; en: string };

export const translations = {
  nav: {
    brief: { it: "La sfida", en: "The brief" },
    hardware: { it: "Hardware", en: "Hardware" },
    schedule: { it: "Programma", en: "Schedule" },
    info: { it: "Info", en: "Info" },
    venue: { it: "Dove", en: "Venue" },
    dashboard: { it: "Dashboard", en: "Dashboard" },
    menuOpen: { it: "Apri il menu", en: "Open menu" },
    menuClose: { it: "Chiudi il menu", en: "Close menu" },
    primary: { it: "Navigazione principale", en: "Main navigation" },
    home: { it: "Torna all'inizio", en: "Back to top" },
    language: { it: "Lingua", en: "Language" },
    skipToContent: { it: "Vai al contenuto", en: "Skip to content" },
  },

  landing: {
    ctaOpen: { it: "Iscriviti su Luma", en: "Register on Luma" },
    ctaWaitlist: { it: "Entra in lista d'attesa su Luma", en: "Join the waitlist on Luma" },
    ctaClosed: { it: "Vedi l'evento su Luma", en: "See the event on Luma" },
    statusWaitlist: {
      it: "Posti esauriti: la lista d'attesa è aperta.",
      en: "Currently full: the waitlist is open.",
    },
    seeSchedule: { it: "Vedi il programma", en: "See the schedule" },
    hostedBy: { it: "Organizzato da", en: "Hosted by" },
    opensInNewTab: { it: "(si apre in una nuova scheda)", en: "(opens in a new tab)" },

    briefTag: { it: "La sfida", en: "The brief" },
    briefTitle: { it: "Hardware + API + Grok", en: "Hardware + API + Grok" },
    briefWith: { it: "Puoi usare", en: "You can use" },

    hardwareTag: { it: "Hardware", en: "Hardware" },
    hardwareTitle: { it: "Su cosa si mettono le mani", en: "What you get to hack on" },

    scheduleTag: { it: "Programma", en: "Schedule" },
    scheduleTitle: { it: "Due giorni, una notte", en: "Two days, one night" },
    scheduleTz: { it: "Orari in ora italiana (CET).", en: "Times are Italian time (CET)." },
    overnight: { it: "Notte", en: "Overnight" },

    speakerTag: { it: "Speaker", en: "Speaker" },
    speakerTitle: { it: "Giovedì con noi", en: "With us on Thursday" },

    infoTag: { it: "Info pratiche", en: "Practical info" },
    infoTitle: { it: "Cosa sapere prima di venire", en: "Before you come" },

    venueTag: { it: "Dove", en: "Venue" },
    venueTitle: { it: "Al museo", en: "At the museum" },
    openMaps: { it: "Apri in Google Maps", en: "Open in Google Maps" },
    museumSite: { it: "Sito del museo", en: "Museum website" },
    gettingThere: { it: "Come arrivare", en: "Getting there" },
    overnightNote: {
      it: "Mercoledì notte il museo resta aperto per i partecipanti.",
      en: "On Wednesday night the museum stays open to participants.",
    },

    afterTag: { it: "E dopo", en: "Right after" },

    hostsTag: { it: "Chi organizza", en: "Hosts" },
    hostsTitle: { it: "Le persone dietro l'evento", en: "The people behind it" },

    finalTitle: { it: "Ci vediamo a Pavia", en: "See you in Pavia" },
  },

  footer: {
    event: { it: "Evento", en: "Event" },
    luma: { it: "Pagina Luma", en: "Luma page" },
  },

  // Register / Auth page (platform)
  registerPage: {
    title: { it: "Accedi alla piattaforma", en: "Sign in to the platform" },
    subtitle: {
      it: "Accedi con Google per continuare",
      en: "Sign in with Google to continue",
    },
    signInGoogle: { it: "Accedi con Google", en: "Sign in with Google" },
    alreadyHaveAccount: { it: "Hai già un account?", en: "Already have an account?" },
    connecting: { it: "Connessione…", en: "Connecting…" },
    signInGithub: { it: "Accedi con GitHub", en: "Sign in with GitHub" },
    help: {
      it: "Dopo l'accesso apriamo il tuo profilo partecipante.",
      en: "After sign-in, we will open your participant profile.",
    },
    backHome: { it: "Torna alla home", en: "Back to home" },
  },

  partnerCredits: {
    loading: { it: "Caricamento crediti partner…", en: "Loading partner credits…" },
    title: { it: "Crediti partner", en: "Partner credits" },
    subtitle: {
      it: "Crediti assegnati al tuo account. Riscattali dopo aver aperto il link.",
      en: "Credits issued to your account. Claim after you have opened the redemption link.",
    },
    status: { it: "Stato", en: "Status" },
    openLink: { it: "Apri il link del credito", en: "Open credit link" },
    claim: { it: "Riscatta", en: "Claim credit" },
    claiming: { it: "Riscatto…", en: "Claiming…" },
    emptySubtitle: { it: "Nessun credito assegnato", en: "No credits issued yet" },
    emptyNoTeam: {
      it: "Crea un team o entra con un codice: i crediti partner sono per i membri dei team che superano la selezione.",
      en: "Create a team or join with a code — partner credits are for members of teams that pass screening.",
    },
    emptyDraft: {
      it: "Completa la fase di selezione. Quando il team è approvato, gli organizzatori possono distribuire i crediti.",
      en: "Complete the screening stage. Once your team is approved, organizers can distribute credits.",
    },
    emptySubmitted: {
      it: "La candidatura è in revisione. Dopo l'approvazione i crediti compariranno qui.",
      en: "Your application is under review. After approval, partner credits will appear here once distributed.",
    },
    emptyRejected: {
      it: "In base alla selezione, i crediti partner non sono disponibili per questo team.",
      en: "Based on screening results, partner credits are not available for this team.",
    },
    emptyApprovedWaiting: {
      it: "Il team ha superato la selezione. I crediti compariranno qui quando gli organizzatori li distribuiranno.",
      en: "Your team passed screening. Credits will show here after organizers distribute them from the partner pool.",
    },
  },
} satisfies Record<string, Record<string, Entry>>;

export type TranslationKey = keyof typeof translations;

export function t(section: TranslationKey, key: string, lang: Language): string {
  const item = (translations[section] as Record<string, Entry | undefined>)[key];
  if (!item) return key;
  return item[lang] ?? item.en;
}

/**
 * Pick a locale from a per-page copy map (e.g. `{ en: {...}, de: {...} }`),
 * falling back to English when the page has no copy for the active language.
 */
export function pickLocale<M extends { en: unknown }>(map: M, lang: Language): M["en"] {
  return ((map as Record<string, M["en"] | undefined>)[lang] ?? map.en) as M["en"];
}
