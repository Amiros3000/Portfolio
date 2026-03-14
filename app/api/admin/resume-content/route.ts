import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/app/lib/admin-auth";
import { getResumeContent, saveResumeContent } from "@/app/lib/resume-content";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumeContent = await getResumeContent();
  return NextResponse.json({ resumeContent });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as unknown;
    const resumeContent = await saveResumeContent(payload);
    return NextResponse.json({ resumeContent });
  } catch {
    return NextResponse.json(
      { error: "Unable to save resume content." },
      { status: 400 },
    );
  }
}
