"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pitch markings behind the hero. Each line draws itself in on load
 * (.pitch-draw); with animations off they are simply there.
 */
export function PitchLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full text-foreground opacity-[0.07]"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect className="pitch-draw" pathLength={1} x="40" y="40" width="1120" height="520" />
        <line
          className="pitch-draw"
          pathLength={1}
          x1="600"
          y1="40"
          x2="600"
          y2="560"
          style={{ animationDelay: "350ms" }}
        />
        <circle
          className="pitch-draw"
          pathLength={1}
          cx="600"
          cy="300"
          r="90"
          style={{ animationDelay: "550ms" }}
        />
        <rect
          className="pitch-draw"
          pathLength={1}
          x="40"
          y="170"
          width="150"
          height="260"
          style={{ animationDelay: "700ms" }}
        />
        <rect
          className="pitch-draw"
          pathLength={1}
          x="1010"
          y="170"
          width="150"
          height="260"
          style={{ animationDelay: "700ms" }}
        />
      </g>
    </svg>
  );
}

type MatchdayStep = { minute: string; title: string; body: string };

/**
 * The matchday strip. Steps start dimmed only once JS has confirmed the strip
 * is still below the fold, then light up in order as it scrolls into view.
 * No JS, reduced motion, or no IntersectionObserver: it renders fully lit.
 */
export function MatchdayStrip({ steps }: { steps: MatchdayStep[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [state, setState] = useState<"static" | "armed" | "live">("static");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    setState("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("live");
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <ol
      ref={ref}
      data-state={state}
      className="matchday mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
    >
      {steps.map((step, index) => (
        <li
          key={step.minute}
          className="border-t-2 border-accent-ink/60 pt-3"
          style={{ "--step": index } as React.CSSProperties}
        >
          <p className="font-mono text-sm font-medium text-accent-ink">
            {step.minute}
          </p>
          <h4 className="mt-1 font-sans text-sm font-semibold text-foreground">
            {step.title}
          </h4>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

type Decision = { title: string; body: string; tradeoff: string };

/**
 * A decision card: the call, then what it cost, both visible at once. It used
 * to be a flip card with the cost on the back, but readers who skim never
 * flipped it, and the cost is the point of the section.
 */
export function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <article className="flex w-full flex-col gap-3 rounded-lg border border-line-strong bg-surface p-5">
      <p className="meta text-accent-ink">The call</p>
      <h4 className="font-sans text-base leading-snug font-semibold text-foreground">
        {decision.title}
      </h4>
      <p className="text-[0.875rem] leading-relaxed text-muted">
        {decision.body}
      </p>
      <p className="mt-auto border-t border-line pt-3 font-mono text-[0.8125rem] leading-[1.6] text-muted">
        <span className="text-accent-ink">What it cost: </span>
        {decision.tradeoff}
      </p>
    </article>
  );
}
