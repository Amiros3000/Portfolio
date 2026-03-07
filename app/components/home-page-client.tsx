"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowUpRight,
  BrainCircuit,
  Compass,
  Gauge,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortfolioContent } from "@/app/lib/portfolio-content";
import FadeInSection from "./fade-in-section";

type HomePageClientProps = {
  content: PortfolioContent;
};

type FormStatus = "idle" | "sending" | "success" | "error";

type Differentiator = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const differentiators: Differentiator[] = [
  {
    title: "Systems-First Thinking",
    description:
      "I map architecture decisions to long-term maintainability, not short-term hacks.",
    icon: BrainCircuit,
  },
  {
    title: "Performance Under Pressure",
    description:
      "I design for reliability during peak load and edge-case traffic, not only happy paths.",
    icon: Gauge,
  },
  {
    title: "Execution You Can Trust",
    description:
      "I prioritize clear communication, practical tradeoffs, and shipping outcomes that hold up.",
    icon: ShieldCheck,
  },
];

type MetricItem = {
  numericValue?: number;
  suffix?: string;
  displayValue?: string;
  label: string;
};

const signatureMetrics: MetricItem[] = [
  { numericValue: 100, suffix: "+", label: "Active Users Supported" },
  { numericValue: 400, suffix: "+", label: "Concurrent Requests" },
  { displayValue: "Private", label: "Production Codebases" },
];

type ExperienceEntry = {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

const experience: ExperienceEntry[] = [
  {
    title: "Co-Founder & Lead Engineer",
    company: "KonnectTaps",
    location: "Remote",
    period: "Jan 2024 – Present",
    bullets: [
      "Architecting full backend overhaul in Node.js and MySQL for a live product with 100+ active users.",
      "Designing modular architecture to eliminate technical debt and support scalable feature growth.",
      "Driving all engineering decisions end-to-end — system design, data modeling, and production deployment.",
    ],
  },
  {
    title: "Assistant Manager, Operations",
    company: "Marché Adonis",
    location: "Mississauga, ON",
    period: "Nov 2017 – Present",
    bullets: [
      "Led daily operations and scheduling for a 13-person team, serving as primary escalation contact for real-time issues.",
      "Maintained consistent service levels under high-volume, time-sensitive conditions — same reliability mindset I bring to production systems.",
      "7+ years of professional accountability, stakeholder communication, and execution under pressure.",
    ],
  },
];

const education = {
  degree: "B.Eng. Computer Engineering",
  institution: "York University — Lassonde School of Engineering",
  period: "Graduated Jun 2025",
  courses: [
    "Object-Oriented Programming (Java)",
    "Data Structures & Algorithms",
    "Operating Systems",
    "Communication Networks",
    "Software Engineering Principles",
  ],
};

const skillCategories = [
  {
    label: "Languages",
    skills: ["Java", "Python", "SQL", "Bash", "JavaScript (ES6+)"],
  },
  {
    label: "Backend & Web",
    skills: ["Node.js", "Express", "React.js", "RESTful APIs"],
  },
  {
    label: "Infrastructure",
    skills: ["Docker", "Linux/Unix", "MySQL", "Git/GitHub"],
  },
  {
    label: "Concepts",
    skills: ["Distributed Systems", "System Design", "TCP/IP", "HTTP/DNS"],
  },
];

const lookingFor = {
  roles: ["Backend Engineer", "Systems Engineer", "Software Developer"],
  location: "Remote or Hybrid — GTA, Ontario",
  values:
    "Teams that value clean code, clear communication, and engineering ownership.",
  availability: "Immediately",
};

const sectionWrap = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";
const glassPanel =
  "rounded-3xl border border-accent/20 bg-surface/55 backdrop-blur-md";
const formFieldClass =
  "rounded-xl border border-accent/20 bg-surface/60 px-4 py-3 text-sm text-foreground backdrop-blur-md transition";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1.5;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (frame >= totalFrames) {
        setCount(target);
        clearInterval(timer);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function HomePageClient({ content }: HomePageClientProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formMessage, setFormMessage] = useState("");

  async function handleContactSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get("_gotcha") ?? "").trim();

    if (honeypot.length > 0) {
      setFormStatus("success");
      setFormMessage("Message received.");
      return;
    }

    setFormStatus("sending");
    setFormMessage("");

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    try {
      const response = await fetch("https://formspree.io/f/mwvndwea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Unable to send your message right now.";

        try {
          const responseBody = (await response.json()) as {
            errors?: Array<{ message?: string }>;
          };

          const firstError = responseBody.errors?.[0]?.message;
          if (firstError) errorMessage = firstError;
        } catch {
          // Keep fallback error message when response parsing fails.
        }

        setFormStatus("error");
        setFormMessage(errorMessage);
        return;
      }

      setFormStatus("success");
      setFormMessage("Message sent successfully.");
      form.reset();
    } catch {
      setFormStatus("error");
      setFormMessage("Network issue detected. Please try again.");
    }
  }

  return (
    <main className="pb-14 sm:pb-16">
      {/* ── Hero ── */}
      <section className={`${sectionWrap} pb-10 pt-8 sm:pb-14 sm:pt-12`}>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className={`${glassPanel} p-6 sm:p-10 lg:p-12`}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Open to opportunities
              </span>
            </div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase sm:text-sm">
              Computer Engineer
            </p>
            <h1 className="mt-3 text-3xl leading-tight font-semibold text-foreground sm:text-5xl lg:text-6xl">
              {content.hero.headline}
            </h1>
            <p className="mt-4 text-base font-medium text-muted sm:text-xl">
              {content.hero.subheadline}
            </p>
            <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted sm:text-base">
              {content.hero.bio}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#contact-form"
                className="accent-glow inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90 sm:w-auto"
              >
                Contact Me
                <Send className="h-4 w-4" />
              </a>
              <a
                href={content.hero.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10 sm:w-auto"
              >
                View Resume
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className={`${glassPanel} p-6 sm:p-8`}
          >
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              What Sets Me Apart
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
              Engineering with ownership and clarity
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              I combine backend depth with practical product thinking. My focus
              is shipping reliable systems that teams can confidently extend.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {signatureMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-accent/20 bg-surface/70 px-4 py-3"
                >
                  <p className="text-lg font-semibold text-foreground">
                    {metric.numericValue != null ? (
                      <AnimatedCounter
                        target={metric.numericValue}
                        suffix={metric.suffix}
                      />
                    ) : (
                      metric.displayValue
                    )}
                  </p>
                  <p className="text-xs text-muted">{metric.label}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className={sectionWrap}>
        <FadeInSection>
          <div className="mb-4 sm:mb-5">
            <p className="text-xs tracking-[0.16em] text-secondary uppercase">
              Technical Skills
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-4xl">
              Tools I work with regularly
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {skillCategories.map((category) => (
              <div
                key={category.label}
                className={`${glassPanel} p-5`}
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">
                  {category.label}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-accent/15 bg-surface/70 px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className={`${sectionWrap} mt-14 sm:mt-18`}>
        <FadeInSection>
          <div className="mb-6">
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Experience
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-4xl">
              Where I&apos;ve built and shipped
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {experience.map((entry) => (
              <article
                key={entry.company}
                className={`${glassPanel} p-5 sm:p-7`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs tracking-[0.12em] text-muted uppercase">
                      {entry.company} &middot; {entry.location}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">
                      {entry.title}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full border border-accent/20 bg-surface/70 px-3 py-1 text-xs text-muted">
                    {entry.period}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {entry.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Approach ── */}
      <section id="approach" className={`${sectionWrap} mt-14 sm:mt-18`}>
        <FadeInSection>
          <div className={`${glassPanel} p-6 sm:p-8`}>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Approach
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-4xl">
              How I build software differently
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
              Most portfolios list tools. Mine is built around delivery
              behavior: structure, reliability, and communication that reduces
              risk for the team.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {differentiators.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-accent/20 bg-surface/70 p-5"
                  >
                    <div className="inline-flex rounded-xl bg-accent/10 p-2.5">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Projects ── */}
      <section id="projects" className={`${sectionWrap} mt-14 sm:mt-18`}>
        <FadeInSection>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted uppercase">
                Featured Projects
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-4xl">
                Work that proves execution
              </h2>
            </div>
            <p className="max-w-lg text-sm text-muted">
              Selected projects focused on stability, throughput, and practical
              engineering outcomes.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {content.projects.map((project) => (
              <article
                key={project.title}
                className={`${glassPanel} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_40px_-20px_var(--shadow-accent)] sm:p-7`}
              >
                <p className="text-xs tracking-[0.12em] text-muted uppercase">
                  {project.stack}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {project.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent sm:w-auto"
                    >
                      {project.hrefLabel || "Open Link"}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-accent/25 bg-surface/70 px-3 py-1.5 text-xs text-muted">
                      Private codebase
                    </span>
                  )}

                  {project.secondaryHref && (
                    <a
                      href={project.secondaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent sm:w-auto"
                    >
                      {project.secondaryHrefLabel || "Open Link"}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Education ── */}
      <section id="education" className={`${sectionWrap} mt-14 sm:mt-18`}>
        <FadeInSection>
          <div className={`${glassPanel} p-5 sm:p-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.16em] text-muted uppercase">
                  Education
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                  {education.degree}
                </h2>
                <p className="mt-1 text-base font-medium text-muted">
                  {education.institution}
                </p>
              </div>
              <span className="rounded-full border border-accent/20 bg-surface/70 px-3 py-1.5 text-sm text-muted">
                {education.period}
              </span>
            </div>
            <div className="mt-5">
              <p className="mb-3 text-xs tracking-[0.14em] text-muted uppercase">
                Relevant Coursework
              </p>
              <div className="flex flex-wrap gap-2">
                {education.courses.map((course) => (
                  <span
                    key={course}
                    className="rounded-full border border-accent/20 bg-surface/70 px-3 py-1.5 text-sm text-foreground"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── What I'm Looking For ── */}
      <section className={`${sectionWrap} mt-14 sm:mt-18`}>
        <FadeInSection>
          <div className={`${glassPanel} p-6 sm:p-8`}>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              What I&apos;m Looking For
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-4xl">
              The right team, the right problems
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="inline-flex rounded-xl bg-secondary/10 p-2.5">
                  <Compass className="h-4 w-4 text-secondary" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  Target Roles
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lookingFor.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-secondary/25 bg-secondary/8 px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-flex rounded-xl bg-secondary/10 p-2.5">
                  <MapPin className="h-4 w-4 text-secondary" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  Location
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {lookingFor.location}
                </p>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-lg font-semibold text-foreground">
                  What Matters to Me
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {lookingFor.values}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-medium text-foreground">
                    Availability:
                  </span>{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {lookingFor.availability}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className={`${sectionWrap} mt-14 sm:mt-18`}>
        <FadeInSection>
          <div id="contact-form" className={`${glassPanel} p-6 sm:p-8`}>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Contact
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-4xl">
              Let&apos;s build something dependable
            </h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <form
                  action="https://formspree.io/f/mwvndwea"
                  method="POST"
                  className="grid gap-4"
                  onSubmit={handleContactSubmit}
                >
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                  />

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-foreground">
                      Name
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      className={formFieldClass}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-foreground">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      className={formFieldClass}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-foreground">
                      Message
                    </span>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      className={formFieldClass}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={formStatus === "sending"}
                    className="accent-glow mt-2 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto"
                  >
                    {formStatus === "sending" ? "Sending..." : "Send Message"}
                  </button>
                </form>

                <p aria-live="polite" className="mt-4 min-h-5 text-sm">
                  {formStatus === "success" && (
                    <span className="text-emerald-500">{formMessage}</span>
                  )}
                  {formStatus === "error" && (
                    <span className="text-accent">{formMessage}</span>
                  )}
                </p>
              </div>

              <aside className="rounded-2xl border border-accent/20 bg-surface/70 p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Direct Contact
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Prefer a direct conversation? Reach out by email or connect
                  through your preferred platform.
                </p>

                <a
                  href={`mailto:${content.contact.directEmail}`}
                  className="mt-4 inline-flex text-sm font-medium text-accent underline decoration-accent/60 underline-offset-4"
                >
                  {content.contact.directEmail}
                </a>

                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <a
                    href={content.contact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-accent/20 px-3 py-1.5 text-muted transition hover:bg-accent/10 hover:text-foreground"
                  >
                    GitHub
                  </a>
                  <a
                    href={content.contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-accent/20 px-3 py-1.5 text-muted transition hover:bg-accent/10 hover:text-foreground"
                  >
                    LinkedIn
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </FadeInSection>
      </section>
    </main>
  );
}
