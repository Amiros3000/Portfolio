"use client";

import { useState, useCallback, useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import type { ResumeContent } from "@/app/lib/resume-content";
import type { PortfolioContent } from "@/app/lib/portfolio-content";
import ResumeForm from "./resume-form";
import ResumePdfDocument from "./resume-pdf-document";

const ResumePreview = dynamic(() => import("./resume-preview"), { ssr: false });

type ResumeBuilderProps = {
  initialResumeContent: ResumeContent;
  portfolioContent: PortfolioContent;
};

type SaveStatus = "idle" | "saving" | "success" | "error";
type DownloadStatus = "idle" | "generating" | "done" | "error";

const actionBtnClass =
  "rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-50";

export default function ResumeBuilder({
  initialResumeContent,
  portfolioContent,
}: ResumeBuilderProps) {
  const [draft, setDraft] = useState<ResumeContent>(initialResumeContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");
  const [setAsResumeStatus, setSetAsResumeStatus] = useState<SaveStatus>("idle");
  const [setAsResumeMessage, setSetAsResumeMessage] = useState("");

  /* ── Debounced content for preview ── */
  const [previewContent, setPreviewContent] = useState<ResumeContent>(initialResumeContent);

  const schedulePreviewUpdate = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (content: ResumeContent) => {
      clearTimeout(timer);
      timer = setTimeout(() => setPreviewContent(content), 300);
    };
  }, []);

  const handleDraftChange: React.Dispatch<React.SetStateAction<ResumeContent>> = useCallback(
    (action) => {
      setDraft((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        schedulePreviewUpdate(next);
        return next;
      });
    },
    [schedulePreviewUpdate],
  );

  /* ── Save Draft ── */
  async function handleSave() {
    setSaveStatus("saving");
    setSaveMessage("");

    try {
      const response = await fetch("/api/admin/resume-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSaveStatus("error");
        setSaveMessage(errorBody?.error ?? "Failed to save resume.");
        return;
      }

      const body = (await response.json()) as { resumeContent: ResumeContent };
      setDraft(body.resumeContent);
      setPreviewContent(body.resumeContent);
      setSaveStatus("success");
      setSaveMessage("Resume draft saved.");
    } catch {
      setSaveStatus("error");
      setSaveMessage("Network issue. Please try again.");
    }
  }

  /* ── Download PDF ── */
  async function handleDownloadPdf() {
    setDownloadStatus("generating");

    try {
      const blob = await pdf(
        <ResumePdfDocument content={draft} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${draft.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadStatus("done");
      setTimeout(() => setDownloadStatus("idle"), 2000);
    } catch {
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 3000);
    }
  }

  /* ── Set as Portfolio Resume ── */
  async function handleSetAsPortfolioResume() {
    setSetAsResumeStatus("saving");
    setSetAsResumeMessage("");

    try {
      const blob = await pdf(
        <ResumePdfDocument content={draft} />,
      ).toBlob();

      const formData = new FormData();
      formData.append("resume", blob, "resume.pdf");

      const response = await fetch("/api/admin/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSetAsResumeStatus("error");
        setSetAsResumeMessage(errorBody?.error ?? "Upload failed.");
        return;
      }

      setSetAsResumeStatus("success");
      setSetAsResumeMessage("Portfolio resume updated.");
    } catch {
      setSetAsResumeStatus("error");
      setSetAsResumeMessage("Network issue. Please try again.");
    }
  }

  /* ── Auto-populate from Portfolio ── */
  function handleAutoPopulate() {
    const { hero, contact, skills, projects } = portfolioContent;

    setDraft((prev) => {
      const next: ResumeContent = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          email: contact.directEmail || prev.personalInfo.email,
          linkedinUrl: contact.linkedinUrl || prev.personalInfo.linkedinUrl,
          githubUrl: contact.githubUrl || prev.personalInfo.githubUrl,
        },
        summary: hero.bio || prev.summary,
        skills: skills.length > 0 ? skills : prev.skills,
        projects:
          projects.length > 0
            ? projects.map((p) => ({
                title: p.title,
                stack: p.stack,
                description: p.description,
                url: p.href || "",
              }))
            : prev.projects,
      };
      schedulePreviewUpdate(next);
      return next;
    });
  }

  /* ── Render ── */
  return (
    <div className="space-y-5">
      {/* Action Bar */}
      <div className="sticky top-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/25 bg-surface/70 px-4 py-3 shadow-[0_16px_40px_-30px_rgba(220,38,38,0.7)] backdrop-blur-md">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`${actionBtnClass} accent-glow bg-accent font-semibold text-on-accent hover:bg-accent/90`}
        >
          {saveStatus === "saving" ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloadStatus === "generating"}
          className={`${actionBtnClass} border border-accent/30 bg-surface/70 text-foreground hover:bg-accent/10`}
        >
          {downloadStatus === "generating"
            ? "Generating..."
            : downloadStatus === "done"
              ? "Downloaded!"
              : "Download PDF"}
        </button>

        <button
          type="button"
          onClick={handleSetAsPortfolioResume}
          disabled={setAsResumeStatus === "saving"}
          className={`${actionBtnClass} border border-accent/30 bg-surface/70 text-foreground hover:bg-accent/10`}
        >
          {setAsResumeStatus === "saving" ? "Uploading..." : "Set as Portfolio Resume"}
        </button>

        <button
          type="button"
          onClick={handleAutoPopulate}
          className={`${actionBtnClass} border border-accent/30 bg-surface/70 text-foreground hover:bg-accent/10`}
        >
          Auto-populate from Portfolio
        </button>

        {/* Status messages */}
        {saveMessage && (
          <span
            className={`text-sm ${
              saveStatus === "error" ? "text-red-400" : "text-muted"
            }`}
          >
            {saveMessage}
          </span>
        )}
        {setAsResumeMessage && (
          <span
            className={`text-sm ${
              setAsResumeStatus === "error" ? "text-red-400" : "text-muted"
            }`}
          >
            {setAsResumeMessage}
          </span>
        )}
        {downloadStatus === "error" && (
          <span className="text-sm text-red-400">PDF generation failed.</span>
        )}
      </div>

      {/* Split layout: form + preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div>
          <ResumeForm draft={draft} setDraft={handleDraftChange} />
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <ResumePreview resumeContent={previewContent} />
        </div>
      </div>
    </div>
  );
}
