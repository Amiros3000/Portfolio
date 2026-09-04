import { renderToBuffer } from "@react-pdf/renderer";
import ResumePdfDocument from "@/app/components/resume-builder/resume-pdf-document";
import { getResumeContent } from "@/app/lib/resume-content";
import { fillAuditPlaceholders } from "@/app/lib/footpal-fc";

/**
 * The general resume, generated from content/resume-content.json.
 *
 * There is exactly one public resume and it is derived from the same content
 * the site renders, so the two can never disagree. Role-specific resumes stay
 * private and go out by email; this is deliberately the baseline, which is why
 * the site links it as "General resume".
 *
 * Rendered on the SERVER. @react-pdf/renderer is ~685KB of client bundle if it
 * is ever imported into a client component that ships to visitors; doing the
 * render here keeps every byte of it server-side. The link is a plain anchor to
 * this route, so it also survives the browser's own download handling rather
 * than depending on a blob URL and a synthetic click.
 */
export const runtime = "nodejs";

// Regenerated at most once an hour rather than on every request: a PDF render
// is not free, and the source JSON only changes on deploy.
export const revalidate = 3600;

export async function GET() {
  const content = await getResumeContent();

  // Same placeholder contract as the page — see fillAuditPlaceholders. A resume
  // quoting "{testBlocks} tests" would be worse than one quoting a stale count.
  const filled = {
    ...content,
    summary: fillAuditPlaceholders(content.summary),
    experience: content.experience.map((entry) => ({
      ...entry,
      bullets: entry.bullets.map(fillAuditPlaceholders),
    })),
    projects: content.projects.map((project) => ({
      ...project,
      description: fillAuditPlaceholders(project.description),
    })),
  };

  const buffer = await renderToBuffer(<ResumePdfDocument content={filled} />);

  const filename = `${filled.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // `inline` so it previews in the browser tab. Recruiters skim before they
      // save, and a forced download is a worse first interaction.
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
