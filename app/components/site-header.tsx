"use client";

import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = {
  id: string;
  href: string;
  label: string;
};

// `id` must match the section element's id — scroll-spy resolves by element id.
const homeNavItems: NavItem[] = [
  { id: "work", href: "/#work", label: "Work" },
  { id: "experience", href: "/#experience", label: "Experience" },
  { id: "skills", href: "/#skills", label: "Stack" },
  { id: "contact", href: "/#contact", label: "Contact" },
];

function navItemClasses(isActive: boolean): string {
  return [
    "border-b-[1.5px] pb-0.5 font-mono text-[0.75rem] tracking-wide transition-colors",
    isActive
      ? "border-accent text-foreground"
      : "border-transparent text-muted hover:text-foreground",
  ].join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const onHomePage = pathname === "/";
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = useMemo(() => {
    if (!onHomePage) {
      return [{ id: "home", href: "/", label: "Home" }];
    }

    return homeNavItems;
  }, [onHomePage]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!onHomePage) {
      setActiveSection("");
      return;
    }

    const sectionElements = homeNavItems
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);

    if (sectionElements.length === 0) return;

    const updateActiveSection = () => {
      const anchorLine = window.innerHeight * 0.33;
      let nextActive = "";
      let bestTop = -Infinity;

      for (const section of sectionElements) {
        const top = section.getBoundingClientRect().top;
        if (top <= anchorLine && top > bestTop) {
          bestTop = top;
          nextActive = section.id;
        }
      }

      setActiveSection(nextActive);
    };

    let rafId = 0;

    const handleViewportChange = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        updateActiveSection();
        rafId = 0;
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [onHomePage]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="font-mono text-[0.75rem] tracking-[0.14em] text-foreground uppercase"
        >
          Amir Ibrahim
        </Link>

        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={navItemClasses(item.id === activeSection)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label={
              mounted && resolvedTheme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-8 w-8 items-center justify-center border border-line text-muted transition-colors hover:border-line-strong hover:text-foreground"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((previous) => !previous)}
            className="inline-flex h-8 w-8 items-center justify-center border border-line text-muted transition-colors hover:border-line-strong hover:text-foreground md:hidden"
          >
            {mobileOpen ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Menu className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-line md:hidden">
          <nav className="mx-auto flex w-full max-w-5xl flex-col px-5 sm:px-8">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.id}`}
                href={item.href}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileOpen(false);
                }}
                className={`border-b border-line py-3 font-mono text-[0.8125rem] tracking-wide last:border-b-0 ${
                  item.id === activeSection
                    ? "text-accent-ink"
                    : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
