"use client";

import type {
  ResumeContent,
  ResumeExperienceEntry,
  ResumeEducationEntry,
  ResumeProjectEntry,
} from "@/app/lib/resume-content";

type ResumeFormProps = {
  draft: ResumeContent;
  setDraft: React.Dispatch<React.SetStateAction<ResumeContent>>;
};

const cardClass =
  "rounded-2xl border border-accent/22 bg-surface/60 p-5 shadow-[0_18px_50px_-44px_rgba(220,38,38,0.8)] backdrop-blur-md sm:p-6";
const labelClass = "text-sm font-medium text-foreground";
const inputClass =
  "w-full rounded-xl border border-accent/25 bg-surface/70 px-4 py-3 text-sm text-foreground placeholder:text-muted/70 backdrop-blur-md transition focus:border-accent focus:outline-none";
const smallBtnClass =
  "rounded-full border border-accent/30 bg-surface/70 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent/10";
const dangerBtnClass =
  "rounded-full border border-red-500/30 bg-surface/70 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10";

export default function ResumeForm({ draft, setDraft }: ResumeFormProps) {
  /* ── Helpers ── */

  function updatePersonalInfo(field: string, value: string) {
    setDraft((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }

  function updateExperience(
    index: number,
    field: keyof ResumeExperienceEntry,
    value: string | string[],
  ) {
    setDraft((prev) => {
      const experience = [...prev.experience];
      const entry = experience[index];
      if (!entry) return prev;
      experience[index] = { ...entry, [field]: value };
      return { ...prev, experience };
    });
  }

  function addExperience() {
    setDraft((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] },
      ],
    }));
  }

  function removeExperience(index: number) {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function updateEducation(
    index: number,
    field: keyof ResumeEducationEntry,
    value: string | string[],
  ) {
    setDraft((prev) => {
      const education = [...prev.education];
      const entry = education[index];
      if (!entry) return prev;
      education[index] = { ...entry, [field]: value };
      return { ...prev, education };
    });
  }

  function addEducation() {
    setDraft((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", location: "", graduationDate: "", gpa: "", relevantCourses: [] },
      ],
    }));
  }

  function removeEducation(index: number) {
    setDraft((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function updateProject(
    index: number,
    field: keyof ResumeProjectEntry,
    value: string,
  ) {
    setDraft((prev) => {
      const projects = [...prev.projects];
      const entry = projects[index];
      if (!entry) return prev;
      projects[index] = { ...entry, [field]: value };
      return { ...prev, projects };
    });
  }

  function addProject() {
    setDraft((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", stack: "", description: "", url: "" }],
    }));
  }

  function removeProject(index: number) {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-5">
      {/* ── Personal Info ── */}
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground">Personal Info</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5">
            <span className={labelClass}>Full Name</span>
            <input
              type="text"
              value={draft.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={draft.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className={labelClass}>Phone</span>
              <input
                type="tel"
                value={draft.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="(optional)"
                className={inputClass}
              />
            </label>
          </div>
          <label className="grid gap-1.5">
            <span className={labelClass}>Location</span>
            <input
              type="text"
              value={draft.personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className={labelClass}>LinkedIn URL</span>
              <input
                type="url"
                value={draft.personalInfo.linkedinUrl}
                onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className={labelClass}>GitHub URL</span>
              <input
                type="url"
                value={draft.personalInfo.githubUrl}
                onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className="grid gap-1.5">
            <span className={labelClass}>Website URL</span>
            <input
              type="url"
              value={draft.personalInfo.websiteUrl}
              onChange={(e) => updatePersonalInfo("websiteUrl", e.target.value)}
              placeholder="(optional)"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* ── Summary ── */}
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground">Summary</h2>
        <textarea
          value={draft.summary}
          onChange={(e) => setDraft((prev) => ({ ...prev, summary: e.target.value }))}
          rows={4}
          placeholder="2-4 sentence professional summary"
          className={`mt-3 ${inputClass}`}
        />
      </section>

      {/* ── Experience ── */}
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Experience</h2>
          <button type="button" onClick={addExperience} className={smallBtnClass}>
            + Add
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.experience.map((entry, i) => (
            <div
              key={`exp-${i}`}
              className="rounded-xl border border-accent/15 bg-surface/50 p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs tracking-wider text-muted uppercase">
                  Experience {i + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeExperience(i)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={entry.title}
                    onChange={(e) => updateExperience(i, "title", e.target.value)}
                    placeholder="Job Title"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={entry.company}
                    onChange={(e) => updateExperience(i, "company", e.target.value)}
                    placeholder="Company"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    value={entry.location}
                    onChange={(e) => updateExperience(i, "location", e.target.value)}
                    placeholder="Location"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={entry.startDate}
                    onChange={(e) => updateExperience(i, "startDate", e.target.value)}
                    placeholder="Start (e.g. Jan 2024)"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={entry.endDate}
                    onChange={(e) => updateExperience(i, "endDate", e.target.value)}
                    placeholder="End (e.g. Present)"
                    className={inputClass}
                  />
                </div>
                <label className="grid gap-1.5">
                  <span className={labelClass}>Bullet Points (one per line)</span>
                  <textarea
                    value={entry.bullets.join("\n")}
                    onChange={(e) =>
                      updateExperience(
                        i,
                        "bullets",
                        e.target.value.split("\n").filter(Boolean),
                      )
                    }
                    rows={4}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Education ── */}
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Education</h2>
          <button type="button" onClick={addEducation} className={smallBtnClass}>
            + Add
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.education.map((entry, i) => (
            <div
              key={`edu-${i}`}
              className="rounded-xl border border-accent/15 bg-surface/50 p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs tracking-wider text-muted uppercase">
                  Education {i + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeEducation(i)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                <input
                  type="text"
                  value={entry.degree}
                  onChange={(e) => updateEducation(i, "degree", e.target.value)}
                  placeholder="Degree (e.g. B.Eng. Computer Engineering)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={entry.institution}
                  onChange={(e) => updateEducation(i, "institution", e.target.value)}
                  placeholder="Institution"
                  className={inputClass}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    value={entry.location}
                    onChange={(e) => updateEducation(i, "location", e.target.value)}
                    placeholder="Location"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={entry.graduationDate}
                    onChange={(e) => updateEducation(i, "graduationDate", e.target.value)}
                    placeholder="Graduation Date"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={entry.gpa}
                    onChange={(e) => updateEducation(i, "gpa", e.target.value)}
                    placeholder="GPA (optional)"
                    className={inputClass}
                  />
                </div>
                <label className="grid gap-1.5">
                  <span className={labelClass}>Relevant Courses (one per line)</span>
                  <textarea
                    value={entry.relevantCourses.join("\n")}
                    onChange={(e) =>
                      updateEducation(
                        i,
                        "relevantCourses",
                        e.target.value.split("\n").filter(Boolean),
                      )
                    }
                    rows={3}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Skills ── */}
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground">Skills</h2>
        <label className="mt-3 grid gap-1.5">
          <span className={labelClass}>One skill per line (or comma separated)</span>
          <textarea
            value={draft.skills.join("\n")}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                skills: e.target.value
                  .split(/\n|,/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            rows={6}
            className={inputClass}
          />
        </label>
      </section>

      {/* ── Projects ── */}
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <button type="button" onClick={addProject} className={smallBtnClass}>
            + Add
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.projects.map((proj, i) => (
            <div
              key={`proj-${i}`}
              className="rounded-xl border border-accent/15 bg-surface/50 p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs tracking-wider text-muted uppercase">
                  Project {i + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeProject(i)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(i, "title", e.target.value)}
                    placeholder="Project Name"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={proj.stack}
                    onChange={(e) => updateProject(i, "stack", e.target.value)}
                    placeholder="Tech Stack"
                    className={inputClass}
                  />
                </div>
                <textarea
                  value={proj.description}
                  onChange={(e) => updateProject(i, "description", e.target.value)}
                  rows={2}
                  placeholder="Brief description"
                  className={inputClass}
                />
                <input
                  type="url"
                  value={proj.url}
                  onChange={(e) => updateProject(i, "url", e.target.value)}
                  placeholder="URL (optional)"
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
