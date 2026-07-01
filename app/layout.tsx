import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "./components/site-header";
import ChatbotWidget from "./components/chatbot/chatbot-widget";
import SiteFooter from "./components/site-footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Retargeted to full-stack / product software engineering (was "Computer & Systems
// Engineer" with controls/SRE keywords).
export const metadata: Metadata = {
  title: "Amir Ibrahim | Full-Stack Software Developer",
  description:
    "Full-stack software developer and Computer Engineering graduate (York, 2025) who builds and ships web apps end-to-end in TypeScript, Next.js, React, and Node.js. Open to software, full-stack, and frontend roles across Ontario.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  keywords: [
    "Software Developer",
    "Full-Stack Developer",
    "Frontend Engineer",
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
    "PostgreSQL",
    "Web Development",
    "Junior Software Engineer",
  ],
  openGraph: {
    title: "Amir Ibrahim | Full-Stack Software Developer",
    description:
      "Full-stack software developer who builds and ships web apps end-to-end in TypeScript, Next.js, React, and Node.js. Open to software, full-stack, and frontend roles across Ontario.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amir Ibrahim | Full-Stack Software Developer",
    description:
      "Full-stack software developer building and shipping web apps end-to-end in TypeScript, Next.js, React, and Node.js.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <ChatbotWidget />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
