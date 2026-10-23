import { buildEventJsonLd } from "@/lib/event-jsonld";
import { getSiteUrl } from "@/lib/site";

/** Event JSON-LD — homepage only. All values come from lib/event.ts. */
export function StructuredData() {
  const jsonLd = buildEventJsonLd(getSiteUrl());
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output of static config; "<" is escaped so it cannot close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
