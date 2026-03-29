import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/app/lib/admin-auth";
import {
  isSupabaseConfigured,
  uploadResumeToSupabase,
} from "@/app/lib/supabase-rest";
import { updatePortfolioResumeUrl } from "@/app/lib/portfolio-content";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required." },
        { status: 400 },
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (isSupabaseConfigured()) {
      const resumeUrl = await uploadResumeToSupabase(buffer);
      const updatedContent = await updatePortfolioResumeUrl(resumeUrl);

      return NextResponse.json({
        ok: true,
        resumeUrl: updatedContent.hero.resumeUrl,
      });
    }

    const destination = path.join(process.cwd(), "public", "resume.pdf");

    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, buffer);

    const updatedContent = await updatePortfolioResumeUrl("/resume.pdf");

    return NextResponse.json({ ok: true, resumeUrl: updatedContent.hero.resumeUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
