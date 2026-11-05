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
import { isVideoHost, listShowcaseProjects, showcaseLinkKind, showcaseProjectName, visibleUrl } from "@/lib/showcase/projects";

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

  it("keeps the full href and ellipsizes the visible URL on one line", () => {
    const drive = "https://drive.google.com/file/d/1gJwyfIjNC-4sSGFg-MfBZ1ksEAQf9fUp/view?usp=sharing";
    const html = renderToStaticMarkup(
      createElement(Projects, {
        projects: [{ ...nightShift, videoUrl: drive }],
      }),
    );
    expect(html).toContain(`href="${drive}"`);
    expect(html).toContain(`title="${drive}"`);
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain("overflow-hidden");
    expect(html).toContain("text-ellipsis");
    expect(html).not.toContain("break-all");
    expect(html).toContain("drive.google.com/file/d/1gJwyfIjNC-4sSGFg-MfBZ1ksEAQf9fUp/view?usp=sharing");
  });

  it("labels video hosts as Video and other video_url values as Demo", () => {
    const html = renderToStaticMarkup(
      createElement(Projects, {
        projects: [
          { ...harbor, teamId: 11, videoUrl: "https://drive.google.com/file/d/abc/view", demoUrl: null },
          { ...harbor, teamId: 12, videoUrl: "https://gergoai.vercel.app/", demoUrl: null },
          {
            ...harbor,
            teamId: 13,
            videoUrl: "https://github.com/mesagroup/MESA-AgentFailureLab/tree/main/docs/demo",
            demoUrl: null,
          },
          { ...harbor, teamId: 14, videoUrl: null, demoUrl: "https://youtu.be/from-demo" },
        ],
      }),
    );
    const [drive, vercel, githubTree, demoColumn] = cards(html);

    expect(drive).toContain("Video");
    expect(drive).not.toContain("Demo");

    expect(vercel).toContain("Demo");
    expect(vercel).not.toContain("Video");
    expect(vercel).toContain('href="https://gergoai.vercel.app/"');

    expect(githubTree).toContain("Demo");
    expect(githubTree).not.toContain("Video");
    expect(githubTree).toContain('href="https://github.com/mesagroup/MESA-AgentFailureLab/tree/main/docs/demo"');

    expect(demoColumn).toContain("Demo");
    expect(demoColumn).not.toContain("Video");
    expect(demoColumn).toContain('href="https://youtu.be/from-demo"');

    const component = readFileSync(join(process.cwd(), "components/landing/Projects.tsx"), "utf8");
    expect(component).not.toMatch(/Kakashi|Mesappers|gergoai/);
  });
});

describe("video versus demo label", () => {
  it("treats the listed video hosts, including www and subdomains, as Video", () => {
    for (const url of [
      "https://youtube.com/watch?v=1",
      "https://www.youtube.com/watch?v=1",
      "https://m.youtube.com/watch?v=1",
      "https://youtu.be/1",
      "https://vimeo.com/1",
      "https://player.vimeo.com/video/1",
      "https://www.loom.com/share/1",
      "https://drive.google.com/file/d/1/view",
      "https://drive.google.com/drive/folders/1",
    ]) {
      expect(isVideoHost(url), url).toBe(true);
      expect(showcaseLinkKind("video", url), url).toBe("video");
    }
  });

  it("labels other video_url hosts as Demo and always labels demo_url as Demo", () => {
    for (const url of [
      "https://gergoai.vercel.app/",
      "https://github.com/mesagroup/MESA-AgentFailureLab/tree/main/docs/demo",
      "https://docs.google.com/document/d/1",
      "https://example.com/demo",
    ]) {
      expect(isVideoHost(url), url).toBe(false);
      expect(showcaseLinkKind("video", url), url).toBe("demo");
    }
    expect(showcaseLinkKind("demo", "https://www.youtube.com/watch?v=1")).toBe("demo");
    expect(showcaseLinkKind("demo", "https://demo.example.com/pulse")).toBe("demo");
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
