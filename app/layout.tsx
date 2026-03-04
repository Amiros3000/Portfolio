import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "./components/site-header";

export const metadata: Metadata = {
  title: "Amir Ibrahim | Computer Engineer | Software Developer",
  description:
    "Portfolio of Amir Ibrahim, Computer Engineer focused on scalable systems, language-agnostic engineering, and reliable software delivery.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  keywords: [
    "Computer Engineer",
    "Software Developer",
    "Java",
    "Node.js",
    "Python",
    "MySQL",
    "React",
    "System Design",
    "Distributed Systems",
    "Site Reliability Engineering",
  ],
  openGraph: {
    title: "Amir Ibrahim | Computer Engineer | Software Developer",
    description:
      "Scalable systems, robust backend architecture, and impact-driven engineering delivery.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amir Ibrahim | Computer Engineer",
    description:
      "Scalable systems and language-agnostic software engineering.",
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
          <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
