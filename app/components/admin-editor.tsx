"use client";

import { useState } from "react";
import type {
  PortfolioContent,
  PortfolioProject,
} from "@/app/lib/portfolio-content";

type AdminEditorProps = {
  initialContent: PortfolioContent;
  adminEmail: string;
  usingDefaultCredentials: boolean;
};

type SaveStatus = "idle" | "saving" | "success" | "error";
type UploadStatus = "idle" | "uploading" | "success" | "error";

const cardClass =
  "rounded-2xl border border-accent/22 bg-surface/60 p-5 shadow-[0_18px_50px_-44px_rgba(220,38,38,0.8)] backdrop-blur-md sm:p-6";
const labelClass = "text-sm font-medium text-foreground";
const inputClass =
  "rounded-xl border border-accent/25 bg-surface/70 px-4 py-3 text-sm text-foreground placeholder:text-muted/70 backdrop-blur-md transition focus:border-accent focus:outline-none";

function normalizeSkillsFromText(skillsText: string): string[] {
  return skillsText
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function AdminEditor({
  initialContent,
  adminEmail,
  usingDefaultCredentials,
}: AdminEditorProps) {
  const [draft, setDraft] = useState<PortfolioContent>(initialContent);
  const [skillsText, setSkillsText] = useState(initialContent.skills.join("\n"));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  function updateProject(index: number, field: keyof PortfolioProject, value: string) {
    setDraft((previous) => {
      const projects = [...previous.projects];
      const target = projects[index];
      if (!target) return previous;

      projects[index] = {
        ...target,
        [field]: value,
      };

      return {
        ...previous,
        projects,
      };
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaveStatus("saving");
    setSaveMessage("");

    const payload: PortfolioContent = {
      ...draft,
      skills: normalizeSkillsFromText(skillsText),
    };

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setSaveStatus("error");
        setSaveMessage(errorBody?.error ?? "Failed to save changes.");
        return;
      }

      const body = (await response.json()) as { content: PortfolioContent };

      setDraft(body.content);
      setSkillsText(body.content.skills.join("\n"));
      setSaveStatus("success");
      setSaveMessage("Portfolio content saved.");
    } catch {
      setSaveStatus("error");
      setSaveMessage("Network issue detected. Please try again.");
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) {
      setUploadStatus("error");
      setUploadMessage("Please choose a PDF file first.");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await fetch("/api/admin/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setUploadStatus("error");
        setUploadMessage(errorBody?.error ?? "Resume upload failed.");
        return;
      }

      const body = (await response.json()) as { resumeUrl?: string };
      const resumeUrl = body.resumeUrl ?? "/resume.pdf";

      setUploadStatus("success");
      setUploadMessage(`Resume updated at ${resumeUrl}.`);

      setDraft((previous) => ({
        ...previous,
        hero: {
          ...previous.hero,
          resumeUrl,
        },
      }));
    } catch {
      setUploadStatus("error");
      setUploadMessage("Network issue detected. Please try again.");
    }
  }

  return (
    <main className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <section className="relative mb-8 rounded-3xl border border-accent/25 bg-surface/60 p-6 shadow-[0_30px_80px_-65px_rgba(220,38,38,0.9)] backdrop-blur-md sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Edit Portfolio Content
            </h1>
            <p className="mt-2 text-sm text-muted">Signed in as {adminEmail}</p>
            {usingDefaultCredentials && (
              <p className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                Security reminder: set PORTFOLIO_ADMIN_EMAIL and
                PORTFOLIO_ADMIN_PASSWORD in your environment.
              </p>
            )}
          </div>

          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded-full border border-accent/40 bg-surface/70 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent/10"
            >
              Log out
            </button>
          </form>
        </div>
      </section>

      <form onSubmit={handleSave} className="relative space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-foreground">Hero</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2">
                <span className={labelClass}>Headline</span>
                <input
                  type="text"
                  value={draft.hero.headline}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      hero: {
                        ...previous.hero,
                        headline: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>Subheadline</span>
                <input
                  type="text"
                  value={draft.hero.subheadline}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      hero: {
                        ...previous.hero,
                        subheadline: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>Bio</span>
                <textarea
                  value={draft.hero.bio}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      hero: {
                        ...previous.hero,
                        bio: event.target.value,
                      },
                    }))
                  }
                  rows={6}
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>Resume URL</span>
                <input
                  type="text"
                  value={draft.hero.resumeUrl}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      hero: {
                        ...previous.hero,
                        resumeUrl: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-foreground">Skills</h2>
            <label className="mt-4 grid gap-2">
              <span className={labelClass}>One skill per line (or comma separated)</span>
              <textarea
                value={skillsText}
                onChange={(event) => setSkillsText(event.target.value)}
                rows={11}
                className={inputClass}
              />
            </label>
          </section>

          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className={labelClass}>Direct Email</span>
                <input
                  type="email"
                  value={draft.contact.directEmail}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      contact: {
                        ...previous.contact,
                        directEmail: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>GitHub URL</span>
                <input
                  type="url"
                  value={draft.contact.githubUrl}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      contact: {
                        ...previous.contact,
                        githubUrl: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>LinkedIn URL</span>
                <input
                  type="url"
                  value={draft.contact.linkedinUrl}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      contact: {
                        ...previous.contact,
                        linkedinUrl: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-foreground">Resume Upload</h2>
            <p className="mt-2 text-sm text-muted">
              Upload a new PDF to replace your current public resume file.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                className="max-w-full text-sm text-muted"
              />
              <button
                type="button"
                onClick={handleResumeUpload}
                disabled={uploadStatus === "uploading"}
                className="accent-glow rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent/90 disabled:opacity-60"
              >
                {uploadStatus === "uploading" ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-muted">{uploadMessage}</p>
          </section>
        </div>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {draft.projects.map((project, index) => (
              <article
                key={`${project.title}-${index}`}
                className="rounded-2xl border border-accent/18 bg-surface/55 p-4"
              >
                <p className="text-xs tracking-[0.12em] text-muted uppercase">
                  Project {index + 1}
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(event) => updateProject(index, "title", event.target.value)}
                    placeholder="Title"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={project.stack}
                    onChange={(event) => updateProject(index, "stack", event.target.value)}
                    placeholder="Stack"
                    className={inputClass}
                  />
                  <textarea
                    value={project.description}
                    onChange={(event) =>
                      updateProject(index, "description", event.target.value)
                    }
                    rows={4}
                    placeholder="Description"
                    className={inputClass}
                  />
                  <input
                    type="url"
                    value={project.href}
                    onChange={(event) => updateProject(index, "href", event.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={project.hrefLabel}
                    onChange={(event) =>
                      updateProject(index, "hrefLabel", event.target.value)
                    }
                    placeholder="Link label"
                    className={inputClass}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl border border-accent/25 bg-surface/70 px-4 py-3 shadow-[0_16px_40px_-30px_rgba(220,38,38,0.7)] backdrop-blur-md">
          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="accent-glow rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90 disabled:opacity-60"
          >
            {saveStatus === "saving" ? "Saving..." : "Save All Changes"}
          </button>
          <p className="text-sm text-muted">{saveMessage}</p>
        </div>
      </form>
    </main>
  );
}
