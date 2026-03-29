import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "./components/site-header";
import ChatbotWidget from "./components/chatbot/chatbot-widget";
import SiteFooter from "./components/site-footer";

export const metadata: Metadata = {
  title: "Amir Ibrahim | Computer & Systems Engineer",
  description:
    "Computer Engineering graduate (York, 2025) with hands-on experience building and deploying production systems. Open to software, systems, and controls engineering roles across Ontario.",
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
    title: "Amir Ibrahim | Computer & Systems Engineer",
    description:
      "Computer Engineering graduate (York, 2025) with hands-on experience building and deploying production systems. Open to software, systems, and controls engineering roles across Ontario.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amir Ibrahim | Computer & Systems Engineer",
    description:
      "Computer Engineering graduate building and deploying production systems.",
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
      </body>
    </html>
  );
}
