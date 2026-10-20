import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import { AfterEvent, Awards, Brief, Hardware, Hero, Hosts, Practical, Schedule, Speaker, Teams, Venue } from "@/components/landing";
import { formatDateRange } from "@/lib/event";
import { getSiteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}, ${formatDateRange()}` },
  description: siteConfig.description,
  alternates: { canonical: getSiteUrl() + "/" },
  openGraph: {
    url: getSiteUrl(),
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function Home() {
  return (
    <>
      <StructuredData />
      <Navigation />
      <main id="content" className="bg-[#0a0a0a]">
        <Hero />
        <Brief />
        <Hardware />
        <Schedule />
        <Speaker />
        <Teams />
        <Awards />
        <Practical />
        <Venue />
        <AfterEvent />
        <Hosts />
      </main>
      <Footer />
    </>
  );
}
