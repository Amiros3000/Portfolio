import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/lib/admin-auth";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
