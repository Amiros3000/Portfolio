import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/app/lib/admin-auth";
import { getPortfolioContent, savePortfolioContent } from "@/app/lib/portfolio-content";
import { isSupabaseConfigured } from "@/app/lib/supabase-rest";

export const runtime = "nodejs";

const notFoundResponse = () => new NextResponse(null, { status: 404 });

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return notFoundResponse();
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json({ content });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return notFoundResponse();
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
