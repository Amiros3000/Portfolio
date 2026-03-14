import Link from "next/link";
import AdminTabs from "@/app/components/admin-tabs";
import {
  getAdminCredentials,
  isAdminAuthenticated,
} from "@/app/lib/admin-auth";
import { getPortfolioContent } from "@/app/lib/portfolio-content";
import { getResumeContent } from "@/app/lib/resume-content";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
  "rounded-xl border border-accent/25 bg-surface/70 px-4 py-3 text-sm text-foreground placeholder:text-muted/70 backdrop-blur-md transition focus:border-accent focus:outline-none";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isProduction = process.env.NODE_ENV === "production";
  const params = searchParams ? await searchParams : {};
  const errorValue = params.error;
  const hasAuthError =
    errorValue === "invalid" ||
    (Array.isArray(errorValue) && errorValue.includes("invalid"));

  const authenticated = await isAdminAuthenticated();
  const credentials = getAdminCredentials();

  if (!authenticated) {
    return (
      <main className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-6 py-16 lg:px-8">
        <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <article className="relative w-full max-w-xl rounded-3xl border border-accent/25 bg-surface/60 p-8 shadow-[0_28px_80px_-62px_rgba(220,38,38,0.8)] backdrop-blur-md sm:p-10">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Admin Access</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Sign In</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Manage portfolio content, project details, and resume updates from one dashboard.
          </p>

          {credentials.usingDefaultCredentials && (
            <p className="mt-3 rounded-lg border border-accent/25 bg-accent/8 px-3 py-2 text-sm text-accent">
              {isProduction
                ? "Admin environment variables are missing. Set PORTFOLIO_ADMIN_EMAIL and PORTFOLIO_ADMIN_PASSWORD to enable login."
                : "Default local credentials are active. Set PORTFOLIO_ADMIN_EMAIL and PORTFOLIO_ADMIN_PASSWORD before production deployment."}
            </p>
          )}

          {hasAuthError && (
            <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
              Invalid login. Check your email and password.
            </p>
          )}

          <form action="/admin/login" method="POST" className="mt-7 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                type="email"
                name="email"
                defaultValue={credentials.email}
                required
                className={inputClass}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Password</span>
              <input
                type="password"
                name="password"
                required
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              className="accent-glow mt-2 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent/90"
            >
              Sign In
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 inline-flex text-sm text-muted underline decoration-accent/50 underline-offset-4 transition hover:text-foreground"
          >
            Back to portfolio
          </Link>
        </article>
      </main>
    );
  }

  const content = await getPortfolioContent();
  const resumeContent = await getResumeContent();

  return (
    <AdminTabs
      initialContent={content}
      initialResumeContent={resumeContent}
      adminEmail={credentials.email}
      usingDefaultCredentials={credentials.usingDefaultCredentials}
    />
  );
}
