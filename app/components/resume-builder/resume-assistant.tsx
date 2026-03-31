"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  analyzeJobPosting,
  type JobAnalysis,
  type BulletSuggestion,
  type SkillMatch,
} from "@/app/lib/resume-assistant";
import type { ResumeContent } from "@/app/lib/resume-content";

/* ── Props ── */

type ResumeAssistantProps = {
  resume: ResumeContent;
  onUpdateBullet: (
    expIndex: number,
    bulletIndex: number,
    newText: string,
  ) => void;
};

/* ── Sub-components ── */

function SectionPanel({
  title,
  count,
  expanded,
  onToggle,
  accentColor,
  children,
}: {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left transition hover:bg-surface/50"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {title}
          {count !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${accentColor ?? "bg-accent/10 text-accent"}`}
            >
              {count}
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-line/40 px-3.5 py-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillBadge({ match }: { match: SkillMatch }) {
  const colorMap = {
    matched:
      "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
    partial:
      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
    missing: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  };
  const iconMap = {
    matched: <Check className="h-3 w-3" />,
    partial: <span className="text-[10px] font-bold">~</span>,
    missing: <X className="h-3 w-3" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${colorMap[match.status]}`}
    >
      {iconMap[match.status]}
      {match.requirement}
    </div>
  );
}

function BulletCard({
  suggestion,
  applied,
  onApply,
}: {
  suggestion: BulletSuggestion;
  applied: boolean;
  onApply: () => void;
}) {
  // General tip (bulletIndex === -1)
  if (suggestion.bulletIndex === -1) {
    return (
      <div className="rounded-lg border border-secondary/20 bg-secondary/5 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-foreground">
          {suggestion.reason}
        </p>
      </div>
    );
  }

  // No rewrite (metrics tip) — original === improved
  const isMetricsTip = suggestion.original === suggestion.improved;

  return (
    <div className="space-y-1.5 rounded-lg border border-line/40 p-3">
      {!isMetricsTip && (
        <>
          <p className="text-[11px] leading-relaxed text-muted line-through">
            {suggestion.original}
          </p>
          <div className="flex items-start gap-1.5">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
            <p className="text-[11px] leading-relaxed text-foreground">
              {suggestion.improved}
            </p>
          </div>
        </>
      )}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] leading-snug text-muted">
          {suggestion.reason}
        </span>
        {!isMetricsTip && (
          <button
            type="button"
            onClick={onApply}
            disabled={applied}
            className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
          >
            {applied ? "Applied" : "Apply"}
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionRow({
  question,
  answered,
  onAnswer,
}: {
  question: string;
  answered: boolean;
  onAnswer: (a: "yes" | "no") => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line/40 p-2.5">
      <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
      <div className="flex-1">
        <p className="text-[11px] leading-relaxed text-foreground">
          {question}
        </p>
        {!answered && (
          <div className="mt-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => onAnswer("yes")}
              className="rounded-full border border-green-500/25 bg-green-500/8 px-2 py-0.5 text-[10px] font-medium text-green-600 transition hover:bg-green-500/15 dark:text-green-400"
            >
              Yes, add it
            </button>
            <button
              type="button"
              onClick={() => onAnswer("no")}
              className="rounded-full border border-line/40 bg-surface/50 px-2 py-0.5 text-[10px] font-medium text-muted transition hover:bg-surface/80"
            >
              No
            </button>
          </div>
        )}
        {answered && (
          <span className="text-[10px] text-muted">Noted — update your skills section if applicable.</span>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function ResumeAssistant({
  resume,
  onUpdateBullet,
}: ResumeAssistantProps) {
  const [jobText, setJobText] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview"]),
  );
  const [appliedBullets, setAppliedBullets] = useState<Set<string>>(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );

  const handleAnalyze = useCallback(() => {
    if (!jobText.trim()) return;
    setIsAnalyzing(true);
    // Small delay for perceived processing
    setTimeout(() => {
      const result = analyzeJobPosting(jobText, resume);
      setAnalysis(result);
      setIsAnalyzing(false);
      setAppliedBullets(new Set());
      setAnsweredQuestions(new Set());
      setExpandedSections(new Set(["overview"]));
    }, 400);
  }, [jobText, resume]);

  const handleReset = useCallback(() => {
    setJobText("");
    setAnalysis(null);
    setAppliedBullets(new Set());
    setAnsweredQuestions(new Set());
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleApplyBullet = useCallback(
    (suggestion: BulletSuggestion) => {
      onUpdateBullet(suggestion.expIndex, suggestion.bulletIndex, suggestion.improved);
      setAppliedBullets((prev) =>
        new Set(prev).add(`${suggestion.expIndex}-${suggestion.bulletIndex}`),
      );
    },
    [onUpdateBullet],
  );

  const handleAnswerQuestion = useCallback(
    (_index: number, _answer: "yes" | "no") => {
      setAnsweredQuestions((prev) => new Set(prev).add(_index));
    },
    [],
  );

  const scoreColor =
    analysis && analysis.matchScore >= 70
      ? "bg-green-500"
      : analysis && analysis.matchScore >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  // Filter bullet suggestions into rewrites vs tips
  const bulletRewrites =
    analysis?.bulletSuggestions.filter(
      (s) => s.bulletIndex >= 0 && s.original !== s.improved,
    ) ?? [];
  const bulletTips =
    analysis?.bulletSuggestions.filter(
      (s) => s.bulletIndex === -1 || s.original === s.improved,
    ) ?? [];

  return (
    <div className="flex flex-col rounded-2xl border border-accent/25 bg-surface/60 shadow-lg backdrop-blur-md lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-line/60 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            AI Resume Assistant
          </p>
          <p className="text-[11px] text-muted">
            Zero-cost job matching &middot; No API key needed
          </p>
        </div>
        {analysis && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full p-1.5 text-muted transition hover:bg-surface/80 hover:text-foreground"
            title="New analysis"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Job posting input */}
        <div>
          <label
            htmlFor="job-posting-input"
            className="mb-1.5 block text-xs font-medium text-muted"
          >
            Paste a job posting
          </label>
          <textarea
            id="job-posting-input"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description here and I'll analyze how your resume matches..."
            className="w-full resize-none rounded-xl border border-accent/20 bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/50 transition focus:border-accent/40 focus:outline-none"
            rows={analysis ? 3 : 6}
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!jobText.trim() || isAnalyzing}
            className="accent-glow mt-2 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90 disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : analysis ? "Re-analyze" : "Analyze Match"}
          </button>
        </div>

        {/* Analysis results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Overview section */}
              <SectionPanel
                title="Match Overview"
                expanded={expandedSections.has("overview")}
                onToggle={() => toggleSection("overview")}
              >
                <div className="space-y-3">
                  {/* Score bar */}
                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-foreground">
                        {analysis.matchScore}%
                      </span>
                      <span className="text-[11px] text-muted">
                        match for {analysis.jobTitle}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-line/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.matchScore}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${scoreColor}`}
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-green-500/10 px-2 py-1.5">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {analysis.matched.length}
                      </p>
                      <p className="text-[10px] text-muted">Matched</p>
                    </div>
                    <div className="rounded-lg bg-yellow-500/10 px-2 py-1.5">
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {analysis.partial.length}
                      </p>
                      <p className="text-[10px] text-muted">Partial</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 px-2 py-1.5">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {analysis.missing.length}
                      </p>
                      <p className="text-[10px] text-muted">Missing</p>
                    </div>
                  </div>

                  {/* Summary tip */}
                  <p className="text-xs leading-relaxed text-muted">
                    {analysis.summaryTip}
                  </p>
                </div>
              </SectionPanel>

              {/* Skill Breakdown */}
              <SectionPanel
                title="Skill Breakdown"
                count={
                  analysis.matched.length +
                  analysis.partial.length +
                  analysis.missing.length
                }
                expanded={expandedSections.has("skills")}
                onToggle={() => toggleSection("skills")}
              >
                <div className="space-y-2.5">
                  {analysis.matched.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                        Matched
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.matched.map((m) => (
                          <SkillBadge key={m.requirement} match={m} />
                        ))}
                      </div>
                      {/* Evidence */}
                      <div className="mt-1.5 space-y-0.5">
                        {analysis.matched.map((m) =>
                          m.resumeEvidence ? (
                            <p
                              key={m.requirement}
                              className="text-[10px] text-muted"
                            >
                              <span className="font-medium text-foreground">
                                {m.requirement}
                              </span>{" "}
                              &larr; {m.resumeEvidence}
                            </p>
                          ) : null,
                        )}
                      </div>
                    </div>
                  )}

                  {analysis.partial.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
                        Partial Match
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.partial.map((m) => (
                          <SkillBadge key={m.requirement} match={m} />
                        ))}
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {analysis.partial.map((m) =>
                          m.resumeEvidence ? (
                            <p
                              key={m.requirement}
                              className="text-[10px] text-muted"
                            >
                              <span className="font-medium text-foreground">
                                {m.requirement}
                              </span>{" "}
                              &larr; {m.resumeEvidence}
                            </p>
                          ) : null,
                        )}
                      </div>
                    </div>
                  )}

                  {analysis.missing.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                        Missing
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missing.map((m) => (
                          <SkillBadge key={m.requirement} match={m} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionPanel>

              {/* Bullet Improvements */}
              {(bulletRewrites.length > 0 || bulletTips.length > 0) && (
                <SectionPanel
                  title="Bullet Improvements"
                  count={bulletRewrites.length}
                  expanded={expandedSections.has("bullets")}
                  onToggle={() => toggleSection("bullets")}
                  accentColor="bg-secondary/10 text-secondary"
                >
                  <div className="space-y-2">
                    {bulletRewrites.map((s, i) => (
                      <BulletCard
                        key={`rewrite-${i}`}
                        suggestion={s}
                        applied={appliedBullets.has(
                          `${s.expIndex}-${s.bulletIndex}`,
                        )}
                        onApply={() => handleApplyBullet(s)}
                      />
                    ))}
                    {bulletTips.map((s, i) => (
                      <BulletCard
                        key={`tip-${i}`}
                        suggestion={s}
                        applied={false}
                        onApply={() => {}}
                      />
                    ))}
                  </div>
                </SectionPanel>
              )}

              {/* Section Tips */}
              {analysis.sectionAdvice.length > 0 && (
                <SectionPanel
                  title="Section Tips"
                  count={analysis.sectionAdvice.length}
                  expanded={expandedSections.has("sections")}
                  onToggle={() => toggleSection("sections")}
                  accentColor="bg-secondary/10 text-secondary"
                >
                  <div className="space-y-2">
                    {analysis.sectionAdvice.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg border border-line/40 p-2.5"
                      >
                        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
                        <p className="text-[11px] leading-relaxed text-foreground">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionPanel>
              )}

              {/* Clarifying Questions */}
              {analysis.clarifyingQuestions.length > 0 && (
                <SectionPanel
                  title="Questions for You"
                  count={analysis.clarifyingQuestions.length}
                  expanded={expandedSections.has("questions")}
                  onToggle={() => toggleSection("questions")}
                  accentColor="bg-secondary/10 text-secondary"
                >
                  <div className="space-y-2">
                    {analysis.clarifyingQuestions.map((q, i) => (
                      <QuestionRow
                        key={i}
                        question={q}
                        answered={answeredQuestions.has(i)}
                        onAnswer={(a) => handleAnswerQuestion(i, a)}
                      />
                    ))}
                  </div>
                </SectionPanel>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!analysis && !isAnalyzing && (
          <div className="py-6 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent/30" />
            <p className="text-sm font-medium text-foreground">
              Paste a job posting above
            </p>
            <p className="mt-1 text-xs text-muted">
              I&apos;ll analyze skill matches, suggest bullet rewording, and
              recommend how to tailor your resume.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
