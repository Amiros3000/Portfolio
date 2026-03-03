import Link from "next/link";

type Project = {
  title: string;
  techStack: string;
  result: string;
  href: string;
};

const projects: Project[] = [
  {
    title: "KonnectTaps",
    techStack: "Node.js, MySQL, React",
    result:
      "Rebuilt the backend architecture to support 100+ active users with stronger data integrity and stable production performance.",
    href: "https://github.com/",
  },
  {
    title: "CSA Capstone (SOSO)",
    techStack: "Python, API Design, Data Visualization",
    result:
      "Defined telemetry and scheduling API requirements and delivered a visualization workflow that improved mission planning clarity.",
    href: "https://github.com/",
  },
  {
    title: "MIX Registration System",
    techStack: "Node.js, MySQL, High-Availability Architecture",
    result:
      "Handled 400+ concurrent requests during peak registration windows with zero downtime in production.",
    href: "https://github.com/",
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            Featured Work
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Engineering Projects with Measurable Impact
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Focused work across product delivery, system reliability, and
          high-performance engineering.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.title}
            className="rounded-3xl border border-accent/35 bg-surface p-6 transition hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_24px_55px_-45px_var(--shadow-accent)]"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {project.title}
            </h3>
            <p className="mt-2 text-sm font-medium text-muted">
              Tech Stack: {project.techStack}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {project.result}
            </p>
            <Link
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent transition hover:bg-accent/90"
            >
              View on GitHub
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
