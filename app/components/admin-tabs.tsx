"use client";

import { useState } from "react";
import type { PortfolioContent } from "@/app/lib/portfolio-content";
import type { ResumeContent } from "@/app/lib/resume-content";
import AdminEditor from "./admin-editor";
import dynamic from "next/dynamic";

const ResumeBuilder = dynamic(
  () => import("./resume-builder/resume-builder"),
  { ssr: false },
);

type AdminTabsProps = {
  initialContent: PortfolioContent;
  initialResumeContent: ResumeContent;
  adminEmail: string;
  usingDefaultCredentials: boolean;
};

type Tab = "portfolio" | "resume";

export default function AdminTabs({
  initialContent,
  initialResumeContent,
  adminEmail,
  usingDefaultCredentials,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");

  const tabs: { id: Tab; label: string }[] = [
    { id: "portfolio", label: "Portfolio" },
    { id: "resume", label: "Resume Builder" },
  ];

  return (
    <main className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      {/* Header */}
      <section className="relative mb-6 rounded-3xl border border-accent/25 bg-surface/60 p-6 shadow-[0_30px_80px_-65px_rgba(220,38,38,0.9)] backdrop-blur-md sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Admin Panel
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted">
              Signed in as {adminEmail}
            </p>
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

        {/* Tab Bar */}
        <div className="mt-5 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-accent text-on-accent shadow-[0_4px_16px_-6px_rgba(220,38,38,0.6)]"
                  : "border border-accent/25 bg-surface/70 text-foreground hover:bg-accent/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === "portfolio" && (
        <AdminEditor initialContent={initialContent} />
      )}

      {activeTab === "resume" && (
        <ResumeBuilder
          initialResumeContent={initialResumeContent}
          portfolioContent={initialContent}
        />
      )}
    </main>
  );
}
