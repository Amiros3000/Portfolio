"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioContent } from "@/app/lib/portfolio-content";
import {
  FOOTPAL_AUDIT_DATE,
  footpalDecisions,
  footpalRelease,
  footpalSpec,
  footpalStack,
  type Decision,
} from "@/app/lib/footpal-fc";
import {
  KONNECTTAPS_REVIEW_DATE,
  konnectTapsDecisions,
} from "@/app/lib/konnecttaps";
import {
  education,
  experience,
  lookingFor,
  skillCategories,
} from "@/app/lib/profile";

type HomePageClientProps = {
  content: PortfolioContent;
};

type FormStatus = "idle" | "sending" | "success" | "error";

const shell = "mx-auto w-full max-w-5xl px-5 sm:px-8";
const railGrid = "grid gap-x-12 gap-y-6 lg:grid-cols-[9rem_minmax(0,1fr)]";
const linkStyle =
  "inline-flex items-center gap-1.5 font-mono text-[0.8125rem] text-accent-ink underline decoration-accent-ink/35 underline-offset-[5px] transition-colors hover:decoration-accent-ink";
const fieldStyle =
  "w-full border border-line bg-surface px-3.5 py-2.5 font-sans text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent-ink focus:outline-none";

/**
 * Host of a URL, for use as a link's visible text.
 *
 * The Flagship link showed a hardcoded "footpalfc.amiribrahim3000.com" while its
 * href came from content, so editing the project URL would have left the text
 * naming somewhere the link no longer went. Derive it instead.
 *
 * Falls back to the raw string if the URL will not parse, which keeps a
 * malformed href visible rather than rendering an empty link.
 */
function displayHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The signature device: the claim, then the cost of the claim.
 *
 * Shared by the Flagship and KonnectTaps sections. It was inline in Flagship
 * and KonnectTaps had no decisions at all, which was the single biggest content
 * problem on the page: the site's whole argument is "every decision has a cost",
 * applied to a solo side project and withheld from the only work done on a team.
 */
function DecisionList({ decisions }: { decisions: Decision[] }) {
  return (
    <>
      <h4 className="meta mt-14 text-accent-ink">Decisions</h4>
      <ul className="mt-6 space-y-9">
        {decisions.map((decision) => (
          <li key={decision.title} className="decision">
            <h5 className="font-sans text-[1.05rem] leading-snug font-semibold tracking-[-0.01em] text-foreground sm:text-lg">
              {decision.title}
            </h5>
            <p className="prose-body mt-2 max-w-2xl text-muted">
              {decision.body}
            </p>
            <p className="mt-3 max-w-2xl font-mono text-[0.8125rem] leading-[1.65] text-muted">
              <span className="text-accent-ink">Tradeoff — </span>
              {decision.tradeoff}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Section shell: hairline rule, sticky mono label in the left rail, content right.
 *
 * The rail label is the section's `h2` and its accessible name, not a styled
 * `<p>`. It looked identical either way, but as a paragraph it left every region
 * unnamed and the heading outline went h1 -> h2 (FootPal FC) -> h3 -> h4 -> h3
 * -> h3 -> h2, with "Also built", "Experience", and "Stack" contributing no
 * heading at all. A screen-reader user landing in the middle of the page had
 * nothing to tell them which section they were in.
 */
function Section({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  const headingId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 border-t border-line"
    >
      <div className={shell}>
        <div className={`${railGrid} py-14 sm:py-20`}>
          <h2
            id={headingId}
            className="meta text-accent-ink lg:sticky lg:top-24 lg:self-start"
          >
            {label}
          </h2>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function HomePageClient({ content }: HomePageClientProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formMessage, setFormMessage] = useState("");

  // projects[0] Flagship, projects[1] KonnectTaps (its own section),
  // the rest compressed into "Also built".
  const [flagship, konnectTaps, ...alsoBuilt] = content.projects;

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
        let errorMessage = "That didn't send. Try again, or email me directly.";

        try {
          const responseBody = (await response.json()) as {
            errors?: Array<{ message?: string }>;
          };

          const firstError = responseBody.errors?.[0]?.message;
          if (firstError) errorMessage = firstError;
        } catch {
          // Keep the fallback message when the error body isn't JSON.
        }

        setFormStatus("error");
        setFormMessage(errorMessage);
        return;
      }

      setFormStatus("success");
      setFormMessage("Message sent. I'll get back to you.");
      form.reset();
    } catch {
      setFormStatus("error");
      setFormMessage(
        "That didn't send — check your connection, or email me directly.",
      );
    }
  }

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────
          The thesis is the artifact, not the person: the headline states what
          FootPal FC actually is, in counts. The name sits in the mono eyebrow
          as metadata.

          The load sequence is the CSS `.rise` animation, not a JS one. These
          elements are visible by default and the keyframes only hide them while
          running, so a stalled animation can never blank the hero — which is
          exactly how the old stat row shipped a permanent "0+". */}
      <section className={`${shell} pt-14 pb-16 sm:pt-24 sm:pb-24`}>
        <p className="meta rise text-muted">
          Amir Ibrahim
          <span className="mx-2 text-line-strong">/</span>
          Full-stack developer
          <span className="mx-2 text-line-strong">/</span>
          GTA, Ontario
        </p>

        <h1
          className="display rise mt-6 max-w-4xl text-[2.1rem] text-foreground sm:text-5xl lg:text-[3.85rem]"
          style={{ animationDelay: "80ms" }}
        >
          {content.hero.headline}
        </h1>

        <p
          className="prose-body rise mt-6 max-w-2xl text-muted sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          {content.hero.subheadline}
        </p>

        {/* Release state only — the counts live in the Flagship section. */}
        <dl
          className="rise mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-3 border-t border-line pt-5"
          style={{ animationDelay: "240ms" }}
        >
          {footpalRelease.map((figure) => (
            <div key={figure.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{figure.label}</dt>
              <dd className="font-mono text-base font-medium text-foreground">
                {figure.value}
              </dd>
              <span aria-hidden className="font-mono text-xs text-muted">
                {figure.label}
              </span>
            </div>
          ))}
        </dl>

        <div
          className="rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-3"
          style={{ animationDelay: "320ms" }}
        >
          <a
            href="#work"
            className="inline-flex items-center bg-accent px-5 py-2.5 font-mono text-[0.8125rem] tracking-wide text-on-accent transition-opacity hover:opacity-90"
          >
            Read the decisions
          </a>
          {flagship?.href ? (
            <a
              href={flagship.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyle}
            >
              Open FootPal FC
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {/*
            "General resume", not "Resume". Amir tailors per role, so anyone
            holding a version he emailed them should be able to tell at a glance
            that this is the baseline rather than a document that contradicts
            theirs. Generated from the same content as this page — see
            app/resume.pdf/route.ts.
          */}
          {content.hero.resumeUrl ? (
            <a href={content.hero.resumeUrl} className={linkStyle}>
              General resume (PDF)
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </section>

      {/* ── About ── */}
      <Section id="about" label="About">
        <p className="prose-body max-w-2xl text-foreground">
          {content.hero.bio}
        </p>
      </Section>

      {/* ── Flagship ── */}
      <Section id="work" label="Flagship">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="display text-3xl text-foreground sm:text-4xl">
            {flagship?.title}
          </h3>
          {flagship?.href ? (
            <a
              href={flagship.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyle}
            >
              {displayHost(flagship.href)}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        <p className="prose-body mt-5 max-w-2xl text-muted">
          {flagship?.description}
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
          {footpalStack.map((item) => (
            <li
              key={item}
              className="border border-line px-2.5 py-1 font-mono text-[0.7rem] tracking-wide text-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        <dl className="mt-8 divide-y divide-line border-t border-b border-line">
          {footpalSpec.map((figure) => (
            <div
              key={figure.label}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-6 py-2.5"
            >
              <dt className="font-mono text-sm font-medium text-foreground">
                {figure.value}
              </dt>
              <dd className="font-mono text-[0.7rem] leading-6 tracking-wide text-muted">
                {figure.label}
              </dd>
            </div>
          ))}
        </dl>

        <DecisionList decisions={footpalDecisions} />

        <p className="mt-10 border-t border-line pt-4 font-mono text-[0.7rem] text-muted">
          Counts verified by code audit, {FOOTPAL_AUDIT_DATE}.
        </p>
      </Section>

      {/* ── Team work ── */}
      <Section id="team" label="Team work">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="display text-3xl text-foreground sm:text-4xl">
            {konnectTaps?.title}
          </h3>
          {konnectTaps?.href ? (
            <a
              href={konnectTaps.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyle}
            >
              {displayHost(konnectTaps.href)}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        <p className="mt-3 font-mono text-[0.7rem] tracking-wide text-muted">
          {konnectTaps?.stack}
          {konnectTaps?.period ? (
            <>
              <span className="mx-2 text-line-strong">/</span>
              {konnectTaps.period}
            </>
          ) : null}
        </p>

        <p className="prose-body mt-5 max-w-2xl text-muted">
          {konnectTaps?.description}
        </p>

        <DecisionList decisions={konnectTapsDecisions} />

        <p className="mt-10 border-t border-line pt-4 font-mono text-[0.7rem] text-muted">
          Read from the source, {KONNECTTAPS_REVIEW_DATE}. The product wound down
          in May 2026.
        </p>
      </Section>

      {/* ── Also built (compressed) ── */}
      <Section label="Also built">
        <ul className="divide-y divide-line border-t border-b border-line">
          {alsoBuilt.map((project) => (
            <li
              key={project.title}
              className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div>
                <h3 className="font-sans text-base font-semibold text-foreground">
                  {project.title}
                </h3>
                <p className="mt-1 font-mono text-[0.7rem] tracking-wide text-muted">
                  {project.stack}
                  {project.period ? (
                    <>
                      <span className="mx-2 text-line-strong">/</span>
                      {project.period}
                    </>
                  ) : null}
                </p>
                <p className="prose-body mt-2.5 max-w-xl text-muted">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-x-5 gap-y-2 sm:justify-end">
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyle}
                  >
                    {project.hrefLabel || "Open"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                {project.secondaryHref ? (
                  <a
                    href={project.secondaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyle}
                  >
                    {project.secondaryHrefLabel || "Open"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Experience ── */}
      <Section id="experience" label="Experience">
        <ul className="space-y-10">
          {experience.map((entry) => (
            <li key={`${entry.company}-${entry.title}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-sans text-lg font-semibold text-foreground">
                  {entry.title}
                </h3>
                <p className="font-mono text-[0.7rem] tracking-wide text-muted">
                  {entry.period}
                </p>
              </div>
              <p className="mt-1 font-mono text-[0.7rem] tracking-wide text-accent-ink">
                {entry.company} — {entry.location}
              </p>
              <ul className="mt-3 space-y-2">
                {entry.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="prose-body max-w-2xl text-muted before:mr-2.5 before:text-accent-ink before:content-['—']"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <h3 className="meta mt-14 text-accent-ink">Education</h3>
        <ul className="mt-5 space-y-6">
          {education.map((entry) => (
            <li key={entry.institution}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h4 className="font-sans text-base font-semibold text-foreground">
                  {entry.degree}
                </h4>
                <p className="font-mono text-[0.7rem] tracking-wide text-muted">
                  {entry.period}
                </p>
              </div>
              <p className="prose-body mt-1 text-muted">{entry.institution}</p>
              <p className="mt-2 max-w-2xl font-mono text-[0.7rem] leading-[1.7] text-muted">
                {entry.courses}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Skills ── */}
      <Section id="skills" label="Stack">
        <ul className="divide-y divide-line border-t border-b border-line">
          {skillCategories.map((category) => (
            <li
              key={category.label}
              className="grid gap-x-8 gap-y-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <p className="font-mono text-[0.7rem] tracking-wide text-muted uppercase">
                {category.label}
              </p>
              <p className="font-sans text-sm leading-relaxed text-foreground">
                {category.skills.join(", ")}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-5 max-w-2xl font-mono text-[0.7rem] leading-[1.7] text-muted">
          Currently learning: AWS, Kubernetes.
        </p>
      </Section>

      {/* ── Contact ── */}
      <Section id="contact" label="Contact">
        <h3 className="display max-w-xl text-3xl text-foreground sm:text-4xl">
          Open to full-stack and frontend roles.
        </h3>

        <dl className="mt-8 divide-y divide-line border-t border-b border-line">
          {lookingFor.map((row) => (
            <div
              key={row.key}
              className="grid gap-x-8 gap-y-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <dt className="font-mono text-[0.7rem] tracking-wide text-muted uppercase">
                {row.key}
              </dt>
              <dd className="font-sans text-sm text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <form
            id="contact-form"
            action="https://formspree.io/f/mwvndwea"
            method="POST"
            className="grid max-w-lg gap-4"
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

            <label className="grid gap-1.5">
              <span className="font-mono text-[0.7rem] tracking-wide text-muted uppercase">
                Name
              </span>
              <input type="text" name="name" required className={fieldStyle} />
            </label>

            <label className="grid gap-1.5">
              <span className="font-mono text-[0.7rem] tracking-wide text-muted uppercase">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                className={fieldStyle}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="font-mono text-[0.7rem] tracking-wide text-muted uppercase">
                Message
              </span>
              <textarea
                name="message"
                rows={5}
                required
                className={fieldStyle}
              />
            </label>

            <div className="mt-1 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={formStatus === "sending"}
                className="inline-flex items-center bg-accent px-5 py-2.5 font-mono text-[0.8125rem] tracking-wide text-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formStatus === "sending" ? "Sending" : "Send message"}
              </button>
              <p aria-live="polite" className="font-mono text-[0.75rem]">
                {formStatus === "success" ? (
                  <span className="text-foreground">{formMessage}</span>
                ) : null}
                {formStatus === "error" ? (
                  <span className="text-accent-ink">{formMessage}</span>
                ) : null}
              </p>
            </div>
          </form>

          <div className="flex flex-col gap-2.5 lg:pt-1">
            <a
              href={`mailto:${content.contact.directEmail}`}
              className={linkStyle}
            >
              {content.contact.directEmail}
            </a>
            <a
              href={content.contact.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyle}
            >
              GitHub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={content.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyle}
            >
              LinkedIn
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
