"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center px-6 py-14 lg:px-8">
      <article className="w-full rounded-3xl border border-accent/25 bg-surface/60 p-8 backdrop-blur-md sm:p-10">
        <p className="text-xs tracking-[0.16em] text-muted uppercase">Admin Error</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted">
          {error.message || "Unable to load the admin page right now."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="red-glow rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent/90"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-accent/35 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent/10"
          >
            Back to Home
          </Link>
        </div>
      </article>
    </main>
  );
}
