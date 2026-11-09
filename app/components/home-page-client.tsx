"use client";

import { useState } from "react";

/** How many decisions show as flip cards before "Show all". */
const FEATURED_DECISIONS = 3;
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioContent } from "@/app/lib/portfolio-content";
import {
  footpalDecisions,
  footpalRelease,
  footpalSpec,
  footpalStack,
  type FootpalLive,
} from "@/app/lib/footpal-fc";
import { SKILL_CATEGORIES } from "@/app/lib/skills";
import { DecisionCard, MatchdayStrip, PitchLines } from "./pitch-motion";

type HomePageClientProps = {
  content: PortfolioContent;
  footpalLive: FootpalLive;
  /** Resolved server-side: null when no resume file exists, so the page never links a 404. */
  resumeHref: string | null;
  /** Resolved server-side: null until public/vamokora-demo.mp4 exists, so no dead player ships. */
  demoVideoHref: string | null;
};

type FormStatus = "idle" | "sending" | "success" | "error";

const experience = [
  {
    title: "Co-Founder & Frontend Developer",
    company: "KonnectTaps",
    location: "Remote",
    href: "https://konnecttaps.com",
    period: "Jan 2024 – May 2026",
    bullets: [
      "Built the frontend for a digital business card platform in React and Next.js, from component work through to the shipped product.",
      "Worked alongside two other developers on scope and product direction.",
      "The platform reached 100+ signups. It wound down in May 2026.",
    ],
  },
  {
    // One entry: the promotion reads better as a line than as two jobs.
    title: "Assistant Deli Manager (promoted from Clerk)",
    company: "Marché Adonis",
    location: "Mississauga, ON",
    period: "Nov 2017 – Present",
    bullets: [
      "Run daily operations and scheduling for a 13-person team, promoted from Clerk in June 2025.",
      "Primary escalation contact through high-volume, time-sensitive shifts.",
      "Worked here throughout a full-time engineering degree.",
    ],
  },
];

const education = [
  {
    degree: "B.Eng. Computer Engineering",
    institution: "York University — Lassonde School of Engineering",
    period: "Graduated Jun 2025",
    courses:
      "Object-Oriented Programming (Java), Data Structures & Algorithms, Operating Systems, Communication Networks, Software Engineering Principles",
  },
  {
    degree: "Electromechanical Engineering Technician — Year 1",
    institution: "Humber College",
    period: "2022 – 2023",
    courses:
      "Control Circuits, Robotics, Mechatronics, Industrial Pneumatics, Statics, Engineering Graphics, Engineering Materials",
  },
];

const lookingFor = [
  {
    key: "Roles",
    value: "Software Developer, Full-Stack Developer, Frontend Engineer",
  },
  { key: "Location", value: "Remote or hybrid — GTA, Ontario" },
  { key: "Availability", value: "Immediately" },
];

/** Real screenshots from VamoKora's about page — the proof the page was missing. */
const footpalShots = [
  {
    src: "/footpal/lineup.webp",
    alt: "VamoKora team drafting: both sides laid out on a pitch as player cards",
    caption:
      "Team drafting — fair sides from the crew's own ratings, drawn on a pitch.",
  },
  {
    src: "/footpal/home.webp",
    alt: "VamoKora home screen: tier promotion card, the next game, and money owed",
    caption: "Matchday home — tier movement, the next game, and who owes whom.",
  },
  {
    src: "/footpal/crew.webp",
    alt: "VamoKora crew hub: the squad as a wall of player cards",
    caption: "The crew wall — every player gets a card, nobody gets a free rating.",
  },
];

/**
 * FootyTracker screens. Simulator SAMPLE data (DEBUG launch arguments), not
 * real games: the heart-rate trace is a generated wave. The caption says so;
 * never present these numbers as Amir's own.
 */
const footyShots = [
  {
    src: "/footytracker/home.webp",
    alt: "FootyTracker home screen: last game's distance, work rate, and an Improving? trend list",
    caption: "Home: the last game, compared only with your own.",
  },
  {
    src: "/footytracker/breaks.webp",
    alt: "FootyTracker match report: two breaks found, each with Sub off, Half-time, or Playing to choose",
    caption: "Breaks found: the workout never pauses, so the app asks afterwards.",
  },
  {
    src: "/footytracker/games.webp",
    alt: "FootyTracker games list: each game's distance, time and heart rate, with missing GPS shown as dashes",
    caption: "Games: missing data shows as --, never as 0.",
  },
];

/** A matchday, start to finish — the app's own five-step flow, borrowed from its about page. */
const matchdaySteps = [
  {
    minute: "0'",
    title: "Pick a time",
    body: "The organiser offers a few days; the busiest time rises to the top.",
  },
  {
    minute: "20'",
    title: "Lock it in",
    body: "Kickoff is set. Everyone says in, maybe, late, or out — waitlist included.",
  },
  {
    minute: "45'",
    title: "Draw the teams",
    body: "Fair sides from the crew's own ratings, laid out on a pitch in a real shape.",
  },
  {
    minute: "70'",
    title: "Split the pitch",
    body: "The fee splits between the people who played, rounded to the nearest 50¢.",
  },
  {
    minute: "90'",
    title: "Rate the game",
    body: "Votes for player of the match. The only thing that moves a rating.",
  },
];

/**
 * Amir's card, in the app's own player-card language. Playful in form, but
 * every figure on it is a real count read from VamoKora's source (see
 * footpalSpec). No self-rated skill scores: the rest of the page refuses to
 * show a number nobody measured, and the card follows the same rule.
 */
const playerCard = {
  name: "Amir Ibrahim",
  number: "18",
  position: "STK",
  since: "Jun 2026",
};

const shell = "mx-auto w-full max-w-5xl px-5 sm:px-8";
const railGrid = "grid gap-x-12 gap-y-6 lg:grid-cols-[9rem_minmax(0,1fr)]";
const linkStyle =
  "inline-flex items-center gap-1.5 font-mono text-[0.8125rem] text-accent-ink underline decoration-accent-ink/35 underline-offset-[5px] transition-colors hover:decoration-accent-ink";
const fieldStyle =
  "w-full border border-line bg-surface px-3.5 py-2.5 font-sans text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent-ink focus:outline-none";

/** Section shell: hairline rule, sticky mono label in the left rail, content right. */
function Section({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-line">
      <div className={shell}>
        <div className={`${railGrid} py-14 sm:py-20`}>
          <h2 className="meta text-accent-ink lg:sticky lg:top-24 lg:self-start">
            {label}
          </h2>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * Amir's player card. The app gives every player one, so he gets one too.
 * On load it turns over from its back (.card-turn). The stats are VamoKora's
 * live counts, not ratings. The tilt lives on the wrapper so the animation's
 * end state and the resting tilt never fight over `transform`.
 */
function PlayerCard({ live }: { live: FootpalLive }) {
  const stats = [
    { label: "Postgres models", value: live.models },
    { label: "HTTP handlers", value: live.handlers },
    { label: "Test blocks", value: live.testBlocks },
    { label: "Commits", value: live.commits },
  ];

  return (
    <figure className="w-56 shrink-0 [perspective:1200px]" aria-label="Amir Ibrahim's player card">
      <div className="faces card-turn">
        <div
          aria-hidden
          className="face face-back flex items-center justify-center rounded-2xl bg-accent font-mono text-2xl tracking-[0.3em] text-on-accent"
        >
          VK
        </div>
        <div className="face rounded-2xl border border-white/10 bg-[#171310] p-5 text-[#f5f1e8] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]">
          <div className="flex items-baseline justify-between font-mono text-[0.6875rem] tracking-[0.14em] text-[#f5f1e8]/60">
            <span>VAMOKORA</span>
            <span>{live.release}</span>
          </div>
          <div
            className="mx-auto mt-4 flex h-28 w-24 flex-col items-center justify-center bg-accent"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%)",
            }}
          >
            <span className="font-sans text-[2.6rem] font-bold leading-none text-on-accent">
              {playerCard.number}
            </span>
            <span className="mt-1 font-mono text-[0.6875rem] tracking-[0.2em] text-on-accent/80">
              {playerCard.position}
            </span>
          </div>
          <p className="mt-3 text-center font-sans text-base font-semibold tracking-[-0.01em]">
            {playerCard.name}
          </p>
          <p className="mt-0.5 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-[#f5f1e8]/60">
            BUILDING SINCE {playerCard.since.toUpperCase()}
          </p>
          <dl className="mt-4 divide-y divide-[#f5f1e8]/10 border-t border-[#f5f1e8]/10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-baseline justify-between py-1.5 font-mono text-[0.6875rem] tracking-wide"
              >
                <dt className="text-[#f5f1e8]/70">{stat.label}</dt>
                <dd className="text-[#f5f1e8]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </figure>
  );
}

export default function HomePageClient({
  content,
  footpalLive,
  resumeHref,
  demoVideoHref,
}: HomePageClientProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [showAllDecisions, setShowAllDecisions] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const [flagship, ...alsoBuilt] = content.projects;

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
    <main id="main-content">
      {/* ── Hero ─────────────────────────────────────────────────────────
          Kickoff intro: pitch lines draw in, the copy rises, then the player
          card turns over. All CSS, and every resting state is the visible one
          (see globals.css), so a stalled animation can never blank the hero —
          which is exactly how an old stat row shipped a permanent "0+". */}
      <section className="relative overflow-hidden">
        <PitchLines />
        <div
          className={`${shell} relative grid gap-12 pt-14 pb-16 sm:pt-20 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center`}
        >
          <div>
            <p className="meta rise text-muted">
              Full-stack developer
              <span className="mx-2 text-line-strong">/</span>
              GTA, Ontario
              <span className="mx-2 text-line-strong">/</span>
              <span className="text-accent-ink">Available now</span>
            </p>

            <h1
              className="display rise mt-6 text-[2.3rem] text-foreground sm:text-5xl lg:text-[3.6rem]"
              style={{ animationDelay: "300ms" }}
            >
              I build full-stack products. One of them runs{" "}
              <span className="text-accent-ink">weekly pickup soccer</span>.
            </h1>

            <p
              className="prose-body rise mt-6 max-w-xl text-muted sm:text-lg"
              style={{ animationDelay: "450ms" }}
            >
              {content.hero.subheadline}
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center gap-x-4 gap-y-3"
              style={{ animationDelay: "600ms" }}
            >
              <a
                href="#matchday"
                className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-mono text-[0.8125rem] tracking-wide text-on-accent transition-opacity hover:opacity-90"
              >
                See a matchday
              </a>
              {flagship?.href ? (
                <a
                  href={flagship.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line-strong px-5 font-mono text-[0.8125rem] tracking-wide text-foreground transition-colors hover:border-accent-ink hover:text-accent-ink"
                >
                  Open VamoKora
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {resumeHref ? (
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 px-1 font-mono text-[0.8125rem] tracking-wide text-accent-ink underline decoration-accent-ink/35 underline-offset-[5px] transition-colors hover:decoration-accent-ink"
                  aria-label="Amir Ibrahim's résumé (PDF)"
                >
                  Résumé (PDF)
                </a>
              ) : null}
            </div>

            {/* Scoreboard: release state only — the counts live in the Flagship section. */}
            <dl
              className="rise mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-line-strong bg-line-strong font-mono sm:grid-cols-4"
              style={{ animationDelay: "750ms" }}
            >
              {[
                ...footpalRelease(footpalLive),
                { value: "Weekly", label: "games" },
              ].map((figure) => (
                <div
                  key={figure.label}
                  className="bg-background px-4 py-3"
                >
                  <dt className="text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
                    {figure.label}
                  </dt>
                  <dd className="mt-1 text-lg text-foreground">{figure.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The work, up front: the team-draft screen with the player card over it. */}
          <div className="relative mx-auto h-[31rem] w-full max-w-[22rem]">
            <div className="absolute top-0 right-0 w-44 rotate-[4deg] overflow-hidden rounded-[1.6rem] border-[5px] border-surface-strong shadow-xl sm:w-48">
              <Image
                src="/footpal/lineup.webp"
                alt="VamoKora team drafting: both sides laid out on a pitch as player cards"
                width={780}
                height={1688}
                sizes="12rem"
                priority
                className="h-auto w-full"
              />
            </div>
            <div className="absolute top-14 left-0 -rotate-[5deg]">
              <PlayerCard live={footpalLive} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Flagship ── */}
      <Section id="work" label="Flagship · 01">
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
              vamokora.com
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
              className="border border-line px-2.5 py-1 font-mono text-[0.75rem] tracking-wide text-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Signature device: claim, then the cost of the claim. Placed right
            after the stack so a skimming reader reaches it before the screenshots. */}
        <h3 id="decisions" className="meta mt-12 scroll-mt-24 text-accent-ink">
          Decisions I&apos;d defend
        </h3>
        <p className="mt-2 font-mono text-[0.75rem] text-muted">
          Each one is the call, then what it cost. Happy to walk through the
          code on a call.
        </p>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {footpalDecisions.slice(0, FEATURED_DECISIONS).map((decision) => (
            <li key={decision.title} className="flex">
              <DecisionCard decision={decision} />
            </li>
          ))}
        </ul>

        {footpalDecisions.length > FEATURED_DECISIONS ? (
          <>
            <button
              type="button"
              aria-expanded={showAllDecisions}
              aria-controls="more-decisions"
              onClick={() => setShowAllDecisions((value) => !value)}
              className={`${linkStyle} mt-6 min-h-11`}
            >
              {showAllDecisions
                ? "Show fewer"
                : `Show all ${footpalDecisions.length} decisions`}
            </button>
            {showAllDecisions ? (
              <ul id="more-decisions" className="mt-6 space-y-9">
                {footpalDecisions.slice(FEATURED_DECISIONS).map((decision) => (
                  <li key={decision.title} className="decision">
                    <h4 className="font-sans text-[1.05rem] leading-snug font-semibold tracking-[-0.01em] text-foreground sm:text-lg">
                      {decision.title}
                    </h4>
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
            ) : null}
          </>
        ) : null}

        {demoVideoHref ? (
          <figure className="mt-10">
            <video
              className="aspect-[9/16] w-full max-w-xs rounded-xl border border-line bg-surface"
              src={demoVideoHref}
              controls
              preload="metadata"
              playsInline
              aria-label="VamoKora demo: sixty-second screen recording of the matchday flow"
            />
            <figcaption className="mt-3 font-mono text-[0.75rem] leading-relaxed text-muted">
              Sixty seconds, recorded from the live app: RSVP → teams on the
              pitch → cost split.
            </figcaption>
          </figure>
        ) : null}

        <dl className="mt-8 divide-y divide-line border-t border-b border-line">
          {footpalSpec(footpalLive).map((figure) => (
            <div
              key={figure.label}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-6 py-2.5"
            >
              <dt className="font-mono text-sm font-medium text-foreground">
                {figure.value}
              </dt>
              <dd className="font-mono text-[0.75rem] leading-6 tracking-wide text-muted">
                {figure.label}
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="meta mt-14 text-accent-ink">In the app</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {footpalShots.map((shot) => (
            <figure key={shot.src}>
              <div className="overflow-hidden border border-line bg-surface">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={780}
                  height={1688}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 font-mono text-[0.75rem] leading-relaxed text-muted">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <h3 id="matchday" className="meta mt-14 scroll-mt-24 text-accent-ink">
          A matchday, start to finish
        </h3>
        <MatchdayStrip steps={matchdaySteps} />

        <p className="mt-10 border-t border-line pt-4 font-mono text-[0.75rem] text-muted">
          Counts read from VamoKora&apos;s source by its own CI, refreshed
          daily.
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
                <p className="mt-1 font-mono text-[0.75rem] tracking-wide text-muted">
                  {project.stack}
                </p>
                <p className="prose-body mt-2.5 max-w-xl text-muted">
                  {project.description}
                </p>
                {project.title === "FootyTracker" ? (
                  <figure className="mt-6">
                    <div className="grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
                      {footyShots.map((shot) => (
                        <div key={shot.src}>
                          <div className="overflow-hidden rounded-xl border border-line bg-surface">
                            <Image
                              src={shot.src}
                              alt={shot.alt}
                              width={600}
                              height={1304}
                              sizes="(min-width: 640px) 12rem, 30vw"
                              className="h-auto w-full"
                            />
                          </div>
                          <p className="mt-2 font-mono text-[0.6875rem] leading-relaxed text-muted">
                            {shot.caption}
                          </p>
                        </div>
                      ))}
                    </div>
                    <figcaption className="mt-3 font-mono text-[0.6875rem] text-muted">
                      Screens use the simulator&apos;s sample data, not real games.
                    </figcaption>
                  </figure>
                ) : null}
              </div>
              <div className="flex flex-wrap items-start gap-x-5 gap-y-2 sm:justify-end">
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyle}
                    aria-label={`${project.title} — ${project.hrefLabel || "Open"}`}
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
                    aria-label={`${project.title} — ${project.secondaryHrefLabel || "Open"}`}
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
                <p className="font-mono text-[0.75rem] tracking-wide text-muted">
                  {entry.period}
                </p>
              </div>
              <p className="mt-1 font-mono text-[0.75rem] tracking-wide text-accent-ink">
                {entry.company} — {entry.location}
                {entry.href ? (
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkStyle} ml-3`}
                    aria-label={`${entry.company} website`}
                  >
                    Site
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
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
                <p className="font-mono text-[0.75rem] tracking-wide text-muted">
                  {entry.period}
                </p>
              </div>
              <p className="prose-body mt-1 text-muted">{entry.institution}</p>
              <p className="mt-2 max-w-2xl font-mono text-[0.75rem] leading-[1.7] text-muted">
                {entry.courses}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Skills ── */}
      <Section id="skills" label="Stack">
        <ul className="divide-y divide-line border-t border-b border-line">
          {SKILL_CATEGORIES.map((category) => (
            <li
              key={category.label}
              className="grid gap-x-8 gap-y-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <p className="font-mono text-[0.75rem] tracking-wide text-muted uppercase">
                {category.label}
              </p>
              <p className="font-sans text-sm leading-relaxed text-foreground">
                {category.skills.join(", ")}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-5 max-w-2xl font-mono text-[0.75rem] leading-[1.7] text-muted">
          Currently learning: AWS, Kubernetes. Also familiar with Ladder Logic,
          IT/OT networking, and electromechanical systems from Computer and
          Electromechanical Engineering studies.
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
              <dt className="font-mono text-[0.75rem] tracking-wide text-muted uppercase">
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
              <span className="font-mono text-[0.75rem] tracking-wide text-muted uppercase">
                Name
              </span>
              <input type="text" name="name" required className={fieldStyle} />
            </label>

            <label className="grid gap-1.5">
              <span className="font-mono text-[0.75rem] tracking-wide text-muted uppercase">
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
              <span className="font-mono text-[0.75rem] tracking-wide text-muted uppercase">
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
                className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 font-mono text-[0.8125rem] tracking-wide text-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
            {resumeHref ? (
              <a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={linkStyle}
                aria-label="Amir Ibrahim's résumé (PDF)"
              >
                Résumé
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {resumeHref ? (
              <p className="font-mono text-[0.6875rem] text-muted">
                Tailored versions on request.
              </p>
            ) : null}
          </div>
        </div>
      </Section>
    </main>
  );
}
