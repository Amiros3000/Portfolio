"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Send } from "lucide-react";
import type { PortfolioContent } from "@/app/lib/portfolio-content";

type HomePageClientProps = {
  content: PortfolioContent;
};

type FormStatus = "idle" | "sending" | "success" | "error";

const glassPanel =
  "rounded-3xl border border-accent/20 bg-surface/55 backdrop-blur-md";

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
    <main className="pb-16">
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pt-18 lg:px-8">
        <motion.article
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${glassPanel} p-8 sm:p-12`}
        >
          <p className="text-sm tracking-[0.16em] text-muted uppercase">
            Computer Engineer
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold text-foreground sm:text-6xl lg:text-7xl">
            {content.hero.headline}
          </h1>
          <p className="mt-4 text-lg font-medium text-muted sm:text-xl">
            {content.hero.subheadline}
          </p>
          <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted sm:text-base">
            {content.hero.bio}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact-form"
              className="red-glow inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90"
            >
              Contact Me
              <Send className="h-4 w-4" />
            </a>
            <a
              href={content.hero.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
            >
              View Resume
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.article>
      </section>

      <section id="skills" className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            Skills Carousel
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Engineering Toolkit
          </h2>
        </div>

        <div className={`${glassPanel} overflow-hidden p-4`}>
          <motion.div
            className="flex w-max gap-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 24,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            {[...content.skills, ...content.skills].map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-full border border-accent/20 bg-surface/65 px-4 py-2 text-sm font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="projects" className="mx-auto mt-18 max-w-6xl px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              Featured Projects
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Impact-Driven Engineering Work
            </h2>
          </div>
          <p className="max-w-lg text-sm text-muted">
            Practical engineering outcomes across reliability, throughput, and
            automation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {content.projects.map((project) => (
            <article
              key={project.title}
              className={`${glassPanel} p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_48px_-24px_rgba(136,8,8,0.75)]`}
            >
              <p className="text-xs tracking-[0.12em] text-muted uppercase">
                {project.stack}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-foreground">
                {project.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                {project.description}
              </p>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
              >
                {project.hrefLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto mt-18 max-w-6xl px-6 lg:px-8">
        <div id="contact-form" className={`${glassPanel} p-7 sm:p-8`}>
          <p className="text-xs tracking-[0.16em] text-muted uppercase">Contact</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Let&apos;s Build Something Reliable
          </h2>

          <form
            action="https://formspree.io/f/mwvndwea"
            method="POST"
            className="mt-6 grid gap-4"
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
              <span className="text-sm font-medium text-foreground">Name</span>
              <input
                type="text"
                name="name"
                required
                className="rounded-xl border border-accent/20 bg-surface/55 px-4 py-3 text-sm text-foreground backdrop-blur-md transition"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                type="email"
                name="email"
                required
                className="rounded-xl border border-accent/20 bg-surface/55 px-4 py-3 text-sm text-foreground backdrop-blur-md transition"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Message</span>
              <textarea
                name="message"
                rows={5}
                required
                className="rounded-xl border border-accent/20 bg-surface/55 px-4 py-3 text-sm text-foreground backdrop-blur-md transition"
              />
            </label>

            <button
              type="submit"
              disabled={formStatus === "sending"}
              className="red-glow mt-2 inline-flex w-fit items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-65"
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

          <p className="mt-1 text-sm text-muted">
            Prefer direct email? Reach out at{" "}
            <a
              href={`mailto:${content.contact.directEmail}`}
              className="font-medium text-accent underline decoration-accent/60 underline-offset-4"
            >
              {content.contact.directEmail}
            </a>
            .
          </p>

          <div className="mt-4 flex items-center gap-5 text-sm">
            <a
              href={content.contact.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={content.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition hover:text-foreground"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
