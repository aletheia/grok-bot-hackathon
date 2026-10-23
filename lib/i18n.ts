/**
 * UI strings (English only). Event facts (dates, venue, schedule, hosts…) live in lib/event.ts;
 * this file holds the interface copy around them.
 */
export const translations = {
  nav: {
    brief: "The brief",
    hardware: "Hardware",
    schedule: "Schedule",
    tracks: "Tracks",
    teams: "Teams",
    prizes: "Prizes",
    jury: "Jury",
    sponsors: "Sponsors",
    venue: "Venue",
    signIn: "Sign in",
    dashboard: "Dashboard",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    primary: "Main navigation",
    home: "Back to top",
    skipToContent: "Skip to content",
  },

  landing: {
    ctaOpen: "Register on Luma",
    ctaWaitlist: "Join the waitlist on Luma",
    ctaClosed: "See the event on Luma",
    statusWaitlist: "Currently full: the waitlist is open.",
    seeSchedule: "See the schedule",
    hostedBy: "Hosted by",
    opensInNewTab: "(opens in a new tab)",

    briefTag: "The brief",
    briefTitle: "Hardware + API + Grok",
    briefWith: "You can use",

    tracksTag: "Challenges",
    tracksTitle: "Proposed Tracks",
    tracksProposed: "Proposed",
    tracksViewBrief: "View the full brief",
    tracksViewTrack: "Full brief for",
    trackQuestion: "Guiding question",
    trackResult: "Main result",

    hardwareTag: "Hardware",
    hardwareTitle: "What you get to hack on",

    scheduleTag: "Schedule",
    scheduleTitle: "Two days, one night",
    scheduleTz: "All times are Rome time (CET).",
    overnight: "Overnight",
    invitationOnly: "Invitation only",

    speakerTag: "Speaker",
    speakerTitle: "With us on Thursday",

    teamsTag: "Teams",
    teamsTitle: "Three ways to take part",
    teamsCta: "Sign in to the portal",
    teamsRules: "Read the full rules",

    prizesTag: "Prizes",
    prizesTitle: "Prizes for the best builds",
    prizesNote: "Winners are announced at the awards ceremony on Thursday evening.",
    place1: "1st place",
    place2: "2nd place",
    place3: "3rd place",
    prizeTba: "Prize to be announced",
    specialPrizesTitle: "Special and track prizes",
    trackLabel: "Track",

    juryTag: "Jury",
    juryTitle: "Who judges the projects",
    jurorName: "Juror name",
    jurorRole: "Role · Organization",
    jurorBio: "Short bio to be announced.",
    jurorLink: "Profile",
    readMore: "Read more",
    close: "Close",
    criteriaTitle: "Evaluation criteria",

    sponsorsTag: "With the support of",
    sponsorsTitle: "Sponsors",
    sponsorPlaceholder: "Sponsor",
    organizedBy: "Organized by",
    becomeSponsorTitle: "Become a sponsor",
    becomeSponsorText: "Interested in supporting the builders at the museum? Get in touch with the organizers.",
    becomeSponsorCta: "Contact us about sponsoring",
    sponsorContactTba: "Sponsorship contact to be announced.",
    lumaPage: "Event page on Luma",
    tba: "To be announced",
    tbaNote: "We will publish this here and on Luma.",

    infoTag: "Practical info",
    infoTitle: "Before you come",

    venueTag: "Venue",
    venueTitle: "At the museum",
    openMaps: "Open in Google Maps",
    museumSite: "Museum website",
    gettingThere: "Getting there",
    overnightNote: "On Wednesday night the museum stays open to participants.",

    afterTag: "Right after",
    followUpLink: "Startup Weekend page",

    hostsTag: "Hosts",
    hostsTitle: "The people behind it",
    partnersLabel: "With",

    finalTitle: "See you in Pavia",
  },

  footer: {
    luma: "Luma page",
    tracks: "Tracks",
    rules: "Team rules",
  },

  partnerCredits: {
    loading: "Loading partner credits…",
    title: "Partner credits",
    subtitle: "Credits issued to your account. Claim after you have opened the redemption link.",
    status: "Status",
    openLink: "Open credit link",
    claim: "Claim credit",
    claiming: "Claiming…",
    emptySubtitle: "No credits issued yet",
    emptyNoTeam:
      "Register a team or join one with a code — partner credits are for members of teams that pass screening.",
    emptyDraft:
      "Complete the screening stage. Once your team is approved, organizers can distribute credits.",
    emptySubmitted:
      "Your application is under review. After approval, partner credits will appear here once distributed.",
    emptyRejected: "Based on screening results, partner credits are not available for this team.",
    emptyApprovedWaiting:
      "Your team passed screening. Credits will show here after organizers distribute them from the partner pool.",
  },
} satisfies Record<string, Record<string, string>>;

export type TranslationKey = keyof typeof translations;

export function t(section: TranslationKey, key: string): string {
  return (translations[section] as Record<string, string | undefined>)[key] ?? key;
}
