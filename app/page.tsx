import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Cog,
  Code2,
  Disc3,
  Globe2,
  GraduationCap,
  Headphones,
  MessageSquare,
  ServerCog,
} from "lucide-react";
import Hero from "./components/hero";
import ProjectsSection from "./components/projects-section";

type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
  outcomes: string[];
};

const services: Service[] = [
  {
    title: "Java & Node.js Backend Development",
    description:
      "Design and implementation of resilient backend services with clear contracts and maintainable architecture.",
    icon: ServerCog,
    outcomes: [
      "Java and Node.js APIs",
      "Secure authentication",
      "MySQL and PostgreSQL integration",
    ],
  },
  {
    title: "System Design & Scalability",
    description:
      "Architect dependable systems and evolve existing platforms without disrupting critical operations.",
    icon: Cog,
    outcomes: [
      "Service decomposition",
      "Scalability planning",
      "Performance tuning",
    ],
  },
  {
    title: "Full-Stack Delivery",
    description:
      "Backend-led product delivery with pragmatic frontend integration and smooth stakeholder communication.",
    icon: Code2,
    outcomes: [
      "Backend + UI handoff",
      "API integration support",
      "Documentation and demos",
    ],
  },
];

const engagementModels = [
  "MVP backend build for startups",
  "Feature acceleration for in-house teams",
  "Consulting engagements for architecture and code quality",
];

const deliverySteps = [
  {
    title: "Discovery",
    detail:
      "Define delivery goals, timelines, and integration constraints for your UK or Canada team setup.",
  },
  {
    title: "Build",
    detail:
      "Deliver incremental milestones with code quality checks, clear communication, and maintainable patterns.",
  },
  {
    title: "Stabilize",
    detail:
      "Support handover, reduce operational risk, and ensure your team can confidently extend the solution.",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-x-clip pb-20">
      <div className="aurora pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="aurora pointer-events-none absolute -right-20 top-96 h-96 w-96 rounded-full bg-accent/20 blur-3xl [animation-delay:1.4s]" />

      <Hero />

      <section
        id="about"
        className="mx-auto max-w-6xl scroll-mt-28 px-6 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-line bg-surface p-7 sm:p-8">
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              About
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Engineering precision with creative rhythm
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              I&apos;m Amir Ibrahim, a Computer Engineer graduated from York
              University in Jun 2025. My technical focus is Java, Node.js, and
              System Design for products that need reliable long-term scale.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Beyond engineering, I produce music in the Lo-fi Hip-Hop space.
              That creative process keeps me detail-oriented and intentional,
              and it shapes how I approach product design, architecture, and
              developer experience.
            </p>
          </article>

          <aside className="rounded-3xl border border-accent/40 bg-surface-strong p-7">
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Latest Remix
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Jujutsu Kaisen Aizo Remix
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A Lo-fi Hip-Hop reinterpretation built around mellow textures and
              clean percussive layers, inspired by the emotional tone of Aizo.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-xs text-muted">
              <Headphones className="h-3.5 w-3.5 text-accent" />
              Currently listening in mix review mode
              <Disc3 className="h-3.5 w-3.5 text-accent" />
            </p>
          </aside>
        </div>
      </section>

      <ProjectsSection />

      <section id="services" className="mx-auto mt-20 max-w-6xl px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Services
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              How I can support your team
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Engagements are scoped around delivery outcomes and communication
            clarity so product and engineering teams stay aligned.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="group rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_24px_55px_-45px_var(--shadow-accent)]"
              >
                <div className="inline-flex rounded-xl bg-accent/10 p-3">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-accent" />
                      <span className="text-muted">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-8 px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="rounded-3xl border border-line bg-surface p-7">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            Engagement Models
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Flexible ways to work together
          </h2>
          <ul className="mt-5 space-y-3">
            {engagementModels.map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <Building2 className="mt-0.5 h-4 w-4 text-accent" />
                <span className="text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-7">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            Profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Technical and academic foundation
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <GraduationCap className="mt-0.5 h-4 w-4 text-accent" />
              Computer Engineering graduate from York University (Jun 2025).
            </li>
            <li className="flex gap-3">
              <Code2 className="mt-0.5 h-4 w-4 text-accent" />
              Technical persona centered on Java, Node.js, and System Design.
            </li>
            <li className="flex gap-3">
              <Globe2 className="mt-0.5 h-4 w-4 text-accent" />
              Services tailored for UK and Canada business environments.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-6 lg:px-8">
        <div className="rounded-3xl border border-line bg-surface p-7">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            Delivery Process
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Structured, transparent execution
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {deliverySteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-line bg-surface-strong p-5"
              >
                <p className="font-mono text-xs text-accent">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto mt-20 max-w-6xl px-6 lg:px-8">
        <div className="rounded-3xl border border-accent/40 bg-surface-strong px-7 py-8 text-foreground sm:px-10 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted uppercase">
                Let&apos;s Connect
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
                Need backend and system design support for your next milestone?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                Share your scope and constraints. I can support short discovery
                work, implementation sprints, or ongoing feature delivery.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="mailto:amir.ibrahim3000@gmail.com"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent/90"
              >
                <MessageSquare className="h-4 w-4" />
                Contact amir.ibrahim3000@gmail.com
              </a>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
                <CalendarClock className="h-4 w-4" />
                Response window: typically within 1 business day
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
