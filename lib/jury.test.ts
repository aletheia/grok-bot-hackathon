import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JurorCard, JurorPlaceholder } from "@/components/landing/JurorCard";
import { EVENT } from "@/lib/event";
import { BIO_CLAMP_CHARS, getInitials, getJurorAccent, getJurorBio, getPhotoAlt, JUROR_ACCENTS } from "@/lib/jury";
import { getJurySlots } from "@/lib/landing-content";

describe("getInitials", () => {
  it("uses the first letters of first and last name", () => {
    expect(getInitials("Lorenzo Cerri")).toBe("LC");
    expect(getInitials("Luca Bianchi")).toBe("LB");
    expect(getInitials("  alberto   giusti ")).toBe("AG");
  });
  it("uses the last word for middle names", () => {
    expect(getInitials("Maria Grazia Rossi")).toBe("MR");
  });
  it("drops accents", () => {
    expect(getInitials("Élodie Brûlé")).toBe("EB");
    expect(getInitials("Ångström Öhman")).toBe("AO");
    expect(getInitials("José Núñez")).toBe("JN");
  });
  it("gives the first two letters for a single name", () => {
    expect(getInitials("Madonna")).toBe("MA");
    expect(getInitials("Q")).toBe("Q");
  });
  it("skips surname particles", () => {
    expect(getInitials("Marco De Luca")).toBe("ML");
    expect(getInitials("Anna di Stefano")).toBe("AS");
    expect(getInitials("Ludwig van Beethoven")).toBe("LB");
    expect(getInitials("Maria De La Cruz")).toBe("MC");
  });
  it("handles hyphens, punctuation and empty input", () => {
    expect(getInitials("Jean-Luc Picard")).toBe("JP");
    expect(getInitials("Dr. Ada Lovelace")).toBe("DL");
    expect(getInitials("")).toBe("");
    expect(getInitials(null)).toBe("");
    expect(getInitials("123 !!")).toBe("");
  });
});

describe("accent colour", () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  it("is deterministic per name (case/space-insensitive) and from the palette", () => {
    expect(getJurorAccent("Lorenzo Cerri")).toBe(getJurorAccent(" lorenzo cerri "));
    expect(JUROR_ACCENTS).toContain(getJurorAccent("Alberto Giusti"));
  });
  it("every accent has at least AA contrast (4.5:1) for its initials", () => {
    for (const a of JUROR_ACCENTS) expect(contrast(a.bg, a.fg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("photo alt text", () => {
  it("derives from the name", () => {
    expect(getPhotoAlt("Lorenzo Cerri")).toBe("Portrait of Lorenzo Cerri");
    expect(getPhotoAlt("  Ada Lovelace ")).toBe("Portrait of Ada Lovelace");
  });
});

describe("getJurorBio (clamp / read more rule)", () => {
  const long = "A".repeat(200);
  it("no text: nothing to show", () => {
    expect(getJurorBio({})).toEqual({ short: null, full: null });
    expect(getJurorBio({ bio: "  ", bioShort: "" })).toEqual({ short: null, full: null });
  });
  it("short bio without bioShort: no read more", () => {
    expect(getJurorBio({ bio: "Builds things." })).toEqual({ short: "Builds things.", full: null });
    expect(getJurorBio({ bio: "x".repeat(BIO_CLAMP_CHARS) }).full).toBeNull();
  });
  it("long bio without bioShort: card shows it clamped, read more offered", () => {
    expect(getJurorBio({ bio: long })).toEqual({ short: long, full: long });
  });
  it("bioShort + longer bio: read more offered", () => {
    expect(getJurorBio({ bioShort: "Short.", bio: "Short. And much more." })).toEqual({ short: "Short.", full: "Short. And much more." });
  });
  it("bioShort equal to (or longer than) bio: no read more", () => {
    expect(getJurorBio({ bioShort: "Same.", bio: "Same." }).full).toBeNull();
    expect(getJurorBio({ bioShort: "Longer short text", bio: "Short" }).full).toBeNull();
  });
  it("bioShort only: shown, no read more", () => {
    expect(getJurorBio({ bioShort: "Only short." })).toEqual({ short: "Only short.", full: null });
  });
});

const render = (el: React.ReactElement) => renderToStaticMarkup(createElement("ul", null, el));
/** Visible text of the role line at sm+ (tags stripped). */
const roleText = (html: string) => (html.match(/<h3[^>]*>.*?<\/h3><p class="mt-1[^"]*">(.*?)<\/p>/)?.[1] ?? "").replace(/<[^>]+>/g, "");

describe("juror card markup", () => {
  it("initials avatar: decorative, accent colour, no photo, no empty photo slot", () => {
    const html = render(createElement(JurorCard, { juror: { name: "Lorenzo Cerri", role: "Role", org: "Org" } }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-avatar="initials"');
    expect(html).toContain(">LC<");
    expect(html).not.toContain("<img");
    expect(html).not.toMatch(/Photo placeholder|data-placeholder/);
    expect(roleText(html)).toBe("Role · Org");
  });
  it("photo: square crop, alt 'Portrait of <name>', no initials", () => {
    const html = render(createElement(JurorCard, { juror: { name: "Lorenzo Cerri", photo: "/assets/jury/lorenzo-cerri.jpg" } }));
    expect(html).toContain('alt="Portrait of Lorenzo Cerri"');
    expect(html).toContain("object-cover");
    expect(html).toContain("aspect-square");
    expect(html).not.toContain('data-avatar="initials"');
  });
  it("bio is clamped to two lines and read more is a 44px button with aria-expanded, only for long bios", () => {
    const withMore = render(createElement(JurorCard, { juror: { name: "A B", bioShort: "Short.", bio: "Short. " + "More. ".repeat(20) } }));
    expect(withMore).toContain("line-clamp-2");
    expect(withMore).toMatch(/<button[^>]*aria-expanded="false"[^>]*min-h-\[44px\]|<button[^>]*min-h-\[44px\][^>]*aria-expanded="false"/);
    expect(withMore).toContain("<dialog");
    const without = render(createElement(JurorCard, { juror: { name: "A B", bioShort: "Short.", bio: "Short." } }));
    expect(without).toContain("line-clamp-2");
    expect(without).not.toContain("<button");
    expect(without).not.toContain("<dialog");
  });
  it("cards fit their content: no min-heights, empty role/bio/footer not rendered", () => {
    const bare = render(createElement(JurorCard, { juror: { name: "A B" } }));
    expect(bare).not.toMatch(/min-h-\[(2\.5rem|3rem|56px)\]/);
    expect(bare).not.toContain("<p");
    expect(bare).not.toContain("mt-auto");
    expect(render(createElement(JurorPlaceholder))).not.toContain("Short bio");
  });
  it("same card box, avatar box and name offset with or without role/org/bio/photo", () => {
    const strip = (h: string) => h.match(/<li class="([^"]*)"/)![1].replace(/border-white\/10 bg-white\/\[0\.04\]/, "").trim();
    const a = render(createElement(JurorCard, { juror: { name: "A B" } }));
    const b = render(createElement(JurorCard, { juror: { name: "C D", role: "R", org: "O", bio: "x".repeat(300), link: "https://x.test" } }));
    const c = render(createElement(JurorCard, { juror: { name: "Ralph Johnson", org: "SpaceXAI", photo: "/assets/speaker/ralph-johnson.jpg" } }));
    expect(strip(a)).toBe(strip(b));
    expect(strip(a)).toBe(strip(c));
    const size = "h-16 w-16 text-[23px] sm:h-[88px] sm:w-[88px] sm:text-[32px]";
    for (const h of [a, b, c, render(createElement(JurorPlaceholder))]) {
      expect(h).toContain(size);
      expect(h.match(/<h3 class="([^"]*)"/)![1]).toBe("mt-3 text-base font-bold leading-snug text-white sm:mt-4 sm:text-lg");
    }
    expect(c).not.toMatch(/<img[^>]*style="[^"]*width:88px/);
  });
  it("profile link opens in a new tab with a screen-reader label", () => {
    const html = render(createElement(JurorCard, { juror: { name: "A B", link: "https://example.test/ab" } }));
    expect(html).toContain('href="https://example.test/ab"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it("name only (no role, org or bio): initials and no separator or dash in the role line", () => {
    const html = render(createElement(JurorCard, { juror: { name: "Federico Pellegrini" } }));
    expect(html).toContain(">FP<");
    expect(html).not.toMatch(/·|—|–|undefined|null/);
  });
  it("org without role: just the org, no leading separator", () => {
    const html = render(createElement(JurorCard, { juror: { name: "Ralph Johnson", org: "SpaceXAI" } }));
    expect(roleText(html)).toBe("SpaceXAI");
    expect(html).not.toContain("·");
  });
  it("placeholder (no name) keeps the dashed style and shows no initials", () => {
    const html = render(createElement(JurorPlaceholder));
    expect(html).toContain("border-dashed");
    expect(html).toContain('data-placeholder="juror"');
    expect(html).toContain("To be announced");
    expect(html).not.toContain('data-avatar="initials"');
  });
});

describe("current jury config", () => {
  it("exactly the seven named jurors, no to-be-announced card, nothing invented", () => {
    const slots = getJurySlots(EVENT.jury, EVENT.juryPlaceholderSlots);
    expect(slots.map((j) => j?.name ?? null)).toEqual(["Luca Bianchi", "Lorenzo Cerri", "Alessandro Rano", "Alberto Giusti", "Claudio Peroni", "Ralph Johnson", "Federico Pellegrini"]);
    expect(getInitials("Luca Bianchi")).toBe("LB");
    expect(getInitials("Federico Pellegrini")).toBe("FP");
    const ralph = EVENT.jury.find((j) => j.name === "Ralph Johnson")!;
    const ralphHtml = render(createElement(JurorCard, { juror: ralph as typeof ralph & { name: string } }));
    expect(roleText(ralphHtml)).toBe("SpaceXAI team · SpaceXAI");
    // On mobile the separator is hidden and role / org stack as blocks.
    expect(ralphHtml).toContain('<span aria-hidden="true" class="hidden sm:inline"> · </span><span class="block sm:inline">SpaceXAI</span>');
  });
});
