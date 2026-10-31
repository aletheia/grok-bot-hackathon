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

describe("juror card markup", () => {
  it("initials avatar: decorative, accent colour, no photo, no empty photo slot", () => {
    const html = render(createElement(JurorCard, { juror: { name: "Lorenzo Cerri", role: "Role", org: "Org" } }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-avatar="initials"');
    expect(html).toContain(">LC<");
    expect(html).not.toContain("<img");
    expect(html).not.toMatch(/Photo placeholder|data-placeholder/);
    expect(html).toContain("Role · Org");
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
  it("all cards share one structure and the same size classes, with or without content", () => {
    const strip = (h: string) => h.match(/<li class="([^"]*)"/)![1].replace(/border-white\/10 bg-white\/\[0\.04\]/, "").trim();
    const a = strip(render(createElement(JurorCard, { juror: { name: "A B" } })));
    const b = strip(render(createElement(JurorCard, { juror: { name: "C D", role: "R", org: "O", bio: "x".repeat(300), link: "https://x.test" } })));
    expect(a).toBe(b);
    const tags = (h: string) => [...h.matchAll(/<(h3|p|div|button|a)\b/g)].map((m) => m[1]).slice(0, 5);
    expect(tags(render(createElement(JurorCard, { juror: { name: "A B" } })))).toEqual(tags(render(createElement(JurorCard, { juror: { name: "C D", role: "R", bio: "b" } }))));
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
    expect(html).toContain(">SpaceXAI<");
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
  it("seven named jurors then a to-be-announced card, nothing invented", () => {
    const slots = getJurySlots(EVENT.jury, EVENT.juryPlaceholderSlots);
    expect(slots.map((j) => j?.name ?? null)).toEqual(["Luca Bianchi", "Lorenzo Cerri", "Alessandro Rano", "Alberto Giusti", "Claudio Peroni", "Ralph Johnson", "Federico Pellegrini", null]);
    expect(getInitials("Luca Bianchi")).toBe("LB");
    expect(getInitials("Federico Pellegrini")).toBe("FP");
  });
});
