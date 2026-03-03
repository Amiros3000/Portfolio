import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Footer from "./components/footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Amir Ibrahim | Computer Engineer | Software Developer UK & Canada",
  description:
    "Portfolio of Amir Ibrahim, Computer Engineer graduated from York University in Jun 2025, focused on Java, Node.js, and System Design for teams in the UK and Canada.",
  keywords: [
    "Freelance Web Development",
    "SRE",
    "Site Reliability Engineering",
    "Software Developer UK",
    "Software Developer Canada",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 border-b border-line/80 bg-background/85 backdrop-blur-xl">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
                <Link
                  href="/#about"
                  className="text-sm font-semibold tracking-[0.16em] text-foreground uppercase transition hover:text-accent"
                >
                  Portfolio
                </Link>
                <nav className="flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1">
                  <Link
                    href="/#about"
                    className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-accent/10 hover:text-foreground"
                  >
                    About
                  </Link>
                  <Link
                    href="/#projects"
                    className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-accent/10 hover:text-foreground"
                  >
                    Projects
                  </Link>
                  <Link
                    href="/#contact"
                    className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-accent/10 hover:text-foreground"
                  >
                    Contact
                  </Link>
                </nav>
              </div>
            </header>
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
