import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "portfolio_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export type AdminCredentials = {
  email: string;
  password: string;
  usingDefaultCredentials: boolean;
};

export function getAdminCredentials(): AdminCredentials {
  const configuredEmail = process.env.PORTFOLIO_ADMIN_EMAIL;
  const configuredPassword = process.env.PORTFOLIO_ADMIN_PASSWORD;

  if (configuredEmail && configuredPassword) {
    return {
      email: configuredEmail,
      password: configuredPassword,
      usingDefaultCredentials: false,
    };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      email: "",
      password: crypto.randomBytes(32).toString("hex"),
      usingDefaultCredentials: true,
    };
  }

  return {
    email: "admin@portfolio.local",
    password: "portfolio-admin",
    usingDefaultCredentials: true,
  };
}

function getSigningSecret(): string {
  return (
    process.env.PORTFOLIO_ADMIN_SECRET ??
    process.env.PORTFOLIO_ADMIN_PASSWORD ??
    "portfolio-admin-secret"
  );
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const credentials = getAdminCredentials();

  if (!credentials.email || !credentials.password) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = credentials.email.trim().toLowerCase();

  return safeEqual(normalizedEmail, expectedEmail) &&
    safeEqual(password, credentials.password);
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiresAtRaw, nonce, signature] = parts;
  const payload = `${expiresAtRaw}.${nonce}`;
  const expectedSignature = signPayload(payload);

  if (!safeEqual(signature, expectedSignature)) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return false;

  return Date.now() < expiresAt;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(sessionToken);
}

export function isAdminRequestAuthenticated(request: NextRequest): boolean {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(sessionToken);
}
