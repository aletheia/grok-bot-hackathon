import { t } from '@/lib/i18n';
import { isHttpUrl, showcaseLinkKind, visibleUrl, type ShowcaseProject } from '@/lib/showcase/projects';
import { Section } from './shared';

type LinkKind = 'repository' | 'video' | 'demo';

const LINK_LABEL: Record<LinkKind, 'projectRepository' | 'projectVideo' | 'projectDemo'> = {
  repository: 'projectRepository',
  video: 'projectVideo',
  demo: 'projectDemo',
};

const ICON = 'mt-[0.15rem] shrink-0';

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={ICON}>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.56 1.4.21 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.58 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={ICON}>
      <path d="M8 6.8v10.4L18 12 8 6.8Z" />
      <rect x="3" y="5" width="18" height="14" rx="3" />
    </svg>
  );
}

function DemoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9Z" />
    </svg>
  );
}

function LinkIcon({ kind }: { kind: LinkKind }) {
  switch (kind) {
    case 'repository':
      return <GithubIcon />;
    case 'video':
      return <VideoIcon />;
    case 'demo':
      return <DemoIcon />;
    default: {
      const exhaustive: never = kind;
      throw new Error(`Unknown project link: ${String(exhaustive)}`);
    }
  }
}

function projectLinks(project: ShowcaseProject): { id: string; kind: LinkKind; href: string }[] {
  const links: { id: string; kind: LinkKind; href: string }[] = [];
  if (isHttpUrl(project.githubUrl)) {
    links.push({ id: 'repository', kind: 'repository', href: project.githubUrl });
  }
  if (project.videoUrl && isHttpUrl(project.videoUrl)) {
    links.push({ id: 'video', kind: showcaseLinkKind('video', project.videoUrl), href: project.videoUrl });
  }
  if (project.demoUrl && isHttpUrl(project.demoUrl)) {
    links.push({ id: 'demo', kind: showcaseLinkKind('demo', project.demoUrl), href: project.demoUrl });
  }
  return links;
}

function ProjectLink({ kind, href }: { kind: LinkKind; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-11 min-w-0 items-start gap-[0.7rem] py-1.5 font-semibold text-[var(--blob-teal)]"
    >
      <LinkIcon kind={kind} />
      <span className="flex min-w-0 flex-col gap-[0.15rem]">
        <span className="inline-flex items-center gap-1.5 group-hover:underline group-hover:underline-offset-4">
          {t('landing', LINK_LABEL[kind])}
          <span className="sr-only">{t('landing', 'opensInNewTab')}</span>
        </span>
        <span
          title={href}
          className="link-url block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.82rem] font-medium leading-[1.35] text-[var(--text-secondary)]"
        >
          {visibleUrl(href)}
        </span>
      </span>
    </a>
  );
}

function ProjectCard({ project }: { project: ShowcaseProject }) {
  const links = projectLinks(project);
  return (
    <li className="min-w-0 list-none">
      <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-[var(--card-hover-border)] hover:bg-[var(--card-hover-bg)] md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{t('landing', 'projectLabel')}</p>
        <h3 className="mt-[0.45rem] font-display text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-white [overflow-wrap:anywhere]">
          {project.projectName}
        </h3>
        <p className="mt-[0.35rem] text-sm text-[var(--text-secondary)]">
          {t('landing', 'projectTeam')} <b className="font-semibold text-white">{project.teamName}</b>
        </p>
        {links.length > 0 ? (
          <div className="mt-auto flex flex-col gap-[0.15rem] pt-6">
            {links.map((link) => (
              <ProjectLink key={link.id} kind={link.kind} href={link.href} />
            ))}
          </div>
        ) : null}
      </article>
    </li>
  );
}

/** Public showcase of submitted projects. Scores stay on the jury vote page. */
export function Projects({ projects }: { projects: ShowcaseProject[] }) {
  return (
    <Section id="projects" tag={t('landing', 'projectsTag')} title={t('landing', 'projectsTitle')} lede={t('landing', 'projectsLede')} accent="teal">
      <ul className="grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.teamId} project={project} />
        ))}
      </ul>
    </Section>
  );
}
