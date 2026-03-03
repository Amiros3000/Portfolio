import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/app/lib/admin-auth";
import { getPortfolioContent, savePortfolioContent } from "@/app/lib/portfolio-content";
import { isSupabaseConfigured } from "@/app/lib/supabase-rest";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json({ content });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production" && !isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is required for admin saves in production. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as unknown;
    const content = await savePortfolioContent(payload);

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Unable to save content." },
      { status: 400 },
    );
  }
}
