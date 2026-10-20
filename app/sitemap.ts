import type { MetadataRoute } from "next";
import { EVENT } from "@/lib/event";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${getSiteUrl()}/`,
      lastModified: new Date(EVENT.contentUpdatedAt),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${getSiteUrl()}/rules`,
      lastModified: new Date(EVENT.contentUpdatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
