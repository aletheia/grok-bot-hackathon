import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PORTAL_DEADLINE } from "@/lib/event";
import { t } from "@/lib/i18n";

const { orderBy } = vi.hoisted(() => ({ orderBy: vi.fn() }));

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy,
          }),
        }),
      }),
    }),
  },
}));

import { Projects } from "@/components/landing/Projects";
import { listShowcaseProjects, showcaseProjectName, visibleUrl } from "@/lib/showcase/projects";

const harbor = {
  teamId: 1,
  projectName: "Harbor",
  teamName: "Atlas",
  githubUrl: "https://github.com/example/harbor",
  videoUrl: "https://youtu.be/dQw4w9wg",
  demoUrl: null,
};

const nightShift = {
  teamId: 2,
  projectName: "Night Shift",
  teamName: "Custodia",
  githubUrl: "https://github.com/example/night-shift",
  videoUrl: null,
  demoUrl: null,
};

const waveform = {
  teamId: 3,
  projectName: "Waveform",
  teamName: "Pulse",
  githubUrl: "https://github.com/example/waveform",
  videoUrl: "https://www.youtube.com/watch?v=abc123xyz",
  demoUrl: "https://demo.example.com/pulse",
};

function cards(html: string): string[] {
  return html.split("<article").slice(1);
}

describe("showcase project fields", () => {
  it("falls back to the team name when the project name is blank", () => {
    expect(showcaseProjectName("  ", "B.M.O.")).toBe("B.M.O.");
    expect(showcaseProjectName(null, "Meteora")).toBe("Meteora");
    expect(showcaseProjectName("Big AI", "Big AI")).toBe("Big AI");
  });

  it("shows the URL text without the scheme or a leading www", () => {
    expect(visibleUrl("https://github.com/example/harbor")).toBe("github.com/example/harbor");
    expect(visibleUrl("https://www.youtube.com/watch?v=abc123xyz")).toBe("youtube.com/watch?v=abc123xyz");
    expect(visibleUrl("https://youtu.be/ojegjFnB07k")).toBe("youtu.be/ojegjFnB07k");
    expect(visibleUrl("https://drive.google.com/file/d/abc/view")).toBe("drive.google.com/file/d/abc/view");
  });

  it("keeps project name, team name, video, and demo as separate fields", async () => {
    orderBy.mockResolvedValueOnce([
      {
        teamId: 4,
        teamName: "Big AI",
        projectName: "  ",
        githubUrl: "  https://github.com/example/big-ai  ",
        videoUrl: "  ",
        demoUrl: " https://demo.example.com/big ",
      },
      {
        teamId: 5,
        teamName: "I Cavalli",
        projectName: "I Cavalli",
        githubUrl: "https://github.com/example/cavalli",
        videoUrl: "https://youtu.be/cavalli",
        demoUrl: null,
      },
    ]);

    const rows = await listShowcaseProjects();

    expect(rows).toEqual([
      {
        teamId: 4,
        projectName: "Big AI",
        teamName: "Big AI",
        githubUrl: "https://github.com/example/big-ai",
        videoUrl: null,
        demoUrl: "https://demo.example.com/big",
      },
      {
        teamId: 5,
        projectName: "I Cavalli",
        teamName: "I Cavalli",
        githubUrl: "https://github.com/example/cavalli",
        videoUrl: "https://youtu.be/cavalli",
        demoUrl: null,
      },
    ]);
    expect(JSON.stringify(rows)).not.toMatch(/email|joinCode|join_code|member/i);
  });
});

describe("submitted projects section", () => {
  beforeEach(() => {
    orderBy.mockReset();
  });

  it("renders Pixel's showcase copy and one card per project", () => {
    const html = renderToStaticMarkup(createElement(Projects, { projects: [harbor, nightShift, waveform] }));

    expect(html).toContain('id="projects"');
    expect(html).toContain(t("landing", "projectsTag"));
    expect(html).toContain(t("landing", "projectsTitle"));
    expect(html).toContain(t("landing", "projectsLede"));
    expect(html).toContain("before 17:00");
    expect(PORTAL_DEADLINE).toBe("2026-11-05T17:00:00+01:00");
    expect(html).not.toContain("Sample layout");
    expect(html).not.toContain("sand-box");
    expect(html).not.toMatch(/Harbor\/Atlas|Look Again|First Steps/);
    expect(cards(html)).toHaveLength(3);
  });

  it("shows the project name, the team name, and only the URLs that exist", () => {
    const html = renderToStaticMarkup(createElement(Projects, { projects: [harbor, nightShift, waveform] }));
    const [harborCard, nightCard, waveCard] = cards(html);

    expect(harborCard).toContain("Harbor");
    expect(harborCard).toContain(">Atlas<");
    expect(harborCard).toContain('href="https://github.com/example/harbor"');
    expect(harborCard).toContain("Repository");
    expect(harborCard).toContain("github.com/example/harbor");
    expect(harborCard).toContain("Video");
    expect(harborCard).toContain("youtu.be/dQw4w9wg");
    expect(harborCard).not.toContain("Demo");

    expect(nightCard).toContain("Night Shift");
    expect(nightCard).toContain(">Custodia<");
    expect(nightCard).toContain("Repository");
    expect(nightCard).not.toContain("Video");
    expect(nightCard).not.toContain("Demo");

    expect(waveCard).toContain('href="https://www.youtube.com/watch?v=abc123xyz"');
    expect(waveCard).toContain(">youtube.com/watch?v=abc123xyz<");
    expect(waveCard).toContain("Demo");
    expect(waveCard).toContain('href="https://demo.example.com/pulse"');
    expect(waveCard).toContain("demo.example.com/pulse");
    expect(html).not.toMatch(/innovation|scalability|marketReadiness|join code|@example\.com/i);
  });

  it("drops a link whose URL is not http(s)", () => {
    const html = renderToStaticMarkup(
      createElement(Projects, {
        projects: [
          {
            ...nightShift,
            githubUrl: "javascript:alert(1)",
            videoUrl: "not a url",
            demoUrl: "https://demo.example.com/ok",
          },
        ],
      }),
    );
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("not a url");
    expect(html).not.toContain("Repository");
    expect(html).not.toContain("Video");
    expect(html).toContain("Demo");
    expect(html).toContain('href="https://demo.example.com/ok"');
  });
});

describe("projects section placement", () => {
  it("sits on the home page immediately after Tracks and is linked from the nav", () => {
    const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
    const tracks = page.indexOf("<Tracks");
    const projects = page.indexOf("<Projects");
    const hardware = page.indexOf("<Hardware");
    expect(tracks).toBeGreaterThan(-1);
    expect(projects).toBeGreaterThan(tracks);
    expect(hardware).toBeGreaterThan(projects);
    expect(page).toContain('dynamic = "force-dynamic"');
    expect(page).toContain("listShowcaseProjects");

    const nav = readFileSync(join(process.cwd(), "components/Navigation.tsx"), "utf8");
    expect(nav).toContain("href: '/#projects'");
    expect(nav.indexOf("'/#tracks'")).toBeLessThan(nav.indexOf("'/#projects'"));
  });

  it("queries the same submitted-team filter as the vote list and does not touch jury votes", () => {
    const src = readFileSync(join(process.cwd(), "lib/showcase/projects.ts"), "utf8");
    const vote = readFileSync(join(process.cwd(), "lib/vote/service.ts"), "utf8");
    expect(src).toContain('eq(team.status, "active")');
    expect(src).toContain("length(btrim(");
    expect(src).toContain("project.githubUrl");
    expect(src).not.toMatch(/juryVote|jury_vote|innovation/);
    expect(vote).toContain("length(btrim(");
  });
});
