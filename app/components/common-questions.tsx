"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MessageCircleQuestion, X } from "lucide-react";

/*
  Replaces the old keyword-matching chatbot, which answered any question it
  wasn't taught with "not sure". Same vetted content, offered as questions to
  click instead of a chat that implies it understands free text.

  Every answer must match the site copy and hold up in an interview.
  Standing corrections, do not reintroduce:
   - KonnectTaps: Amir was FRONTEND, three developers total, 100+ SIGNUPS
     (not active users), wound down May 2026. Payments were the CEO's work.
   - VamoKora: never state a player count (it grows, and other crews exist).
     Its service worker is an offline FALLBACK, never "offline support".
   - No Express anywhere; backend is Next.js API routes and FastAPI.
*/
const questions = [
  {
    q: "Are you open to work?",
    a: "Yes, and I can start immediately. I'm looking for software developer, full-stack, or frontend roles, remote or hybrid in the GTA.",
  },
  {
    q: "What is VamoKora?",
    a: "A pickup soccer app for real crews: RSVPs, fair team drafts, cost splitting, and player ratings. It has run real weekly games since June 2026, on Next.js, TypeScript, PostgreSQL, and Prisma.",
  },
  {
    q: "What did you do at KonnectTaps?",
    a: "I co-founded it and built the frontend, working with two other developers. It reached 100+ signups and wound down in May 2026.",
  },
  {
    q: "What's your stack?",
    a: "TypeScript, Next.js, React, PostgreSQL, and Python, plus Prisma, FastAPI, Docker, and Vercel. The Stack section below has the full list.",
  },
  {
    q: "Have you led people?",
    a: "Yes. At Marché Adonis I run daily operations and scheduling for a 13-person team, after a promotion from Clerk.",
  },
  {
    q: "Where did you study?",
    a: "York University, B.Eng. in Computer Engineering, graduated June 2025.",
  },
];

export default function CommonQuestions() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(0);
  const panelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // On open, move focus into the panel; Escape closes it and returns focus.
  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <section
          id={panelId}
          aria-labelledby={`${panelId}-title`}
          className="rise flex max-h-[min(34rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]"
          style={{ animationDuration: "0.3s" }}
        >
          <div className="flex items-center justify-between border-b border-line py-1 pr-1 pl-4">
            <h2
              id={`${panelId}-title`}
              ref={headingRef}
              tabIndex={-1}
              className="meta text-accent-ink outline-none"
            >
              Common questions
            </h2>
            <button
              type="button"
              aria-label="Close common questions"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="inline-flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {questions.map((item, index) => {
              const isOpen = expanded === index;
              const answerId = `${panelId}-a${index}`;
              return (
                <li key={item.q} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setExpanded(isOpen ? -1 : index)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left font-sans text-[0.9375rem] text-foreground transition-colors hover:text-accent-ink"
                  >
                    <span>{item.q}</span>
                    <span aria-hidden className="font-mono text-accent-ink">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <p
                      id={answerId}
                      className="px-4 pb-4 text-[0.875rem] leading-relaxed text-muted"
                    >
                      {item.a}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="border-t border-line px-4 py-3 font-mono text-[0.75rem] text-muted">
            Not here?{" "}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="text-accent-ink underline decoration-accent-ink/35 underline-offset-4 hover:decoration-accent-ink"
            >
              Ask me directly
            </a>
          </p>
        </section>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 font-mono text-[0.8125rem] text-on-accent shadow-lg transition-opacity hover:opacity-90"
      >
        {open ? (
          <X aria-hidden className="h-4 w-4" />
        ) : (
          <MessageCircleQuestion aria-hidden className="h-4 w-4" />
        )}
        Questions
      </button>
    </div>
  );
}
