import { EVENT, EVENT_DESCRIPTION } from "@/lib/event";
import { getJsonLdSponsors } from "@/lib/landing-content";

/** schema.org Event for the homepage, built only from lib/event.ts. */
export function buildEventJsonLd(siteUrl: string) {
  const { venue, registration, organizer } = EVENT;
  const availability =
    registration.status === "open"
      ? "https://schema.org/InStock"
      : registration.status === "waitlist"
        ? "https://schema.org/SoldOut"
        : "https://schema.org/Discontinued";

  // Only named sponsors/partners; placeholders are never published.
  const sponsors = getJsonLdSponsors(EVENT.sponsors.tiers);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: EVENT.name,
    description: EVENT_DESCRIPTION,
    inLanguage: "en",
    startDate: EVENT.startDate,
    endDate: EVENT.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    maximumAttendeeCapacity: registration.capacity,
    location: {
      "@type": "Place",
      name: venue.name,
      url: venue.url,
      address: {
        "@type": "PostalAddress",
        streetAddress: venue.address.streetAddress,
        postalCode: venue.address.postalCode,
        addressLocality: venue.address.locality,
        addressRegion: venue.address.region,
        addressCountry: venue.address.country,
      },
    },
    organizer: {
      "@type": "Organization",
      name: organizer.name,
      url: registration.url,
    },
    performer: {
      "@type": "Person",
      name: EVENT.speaker.name,
      affiliation: { "@type": "Organization", name: EVENT.speaker.affiliation },
    },
    image: `${siteUrl}/opengraph-image`,
    url: siteUrl,
    offers: {
      "@type": "Offer",
      url: registration.url,
      availability,
    },
    ...(sponsors.length > 0 ? { sponsor: sponsors } : {}),
  };
}
