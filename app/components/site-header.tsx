"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = {
  id: string;
  href: string;
  label: string;
};

const homeNavItems: NavItem[] = [
  { id: "skills", href: "/#skills", label: "Skills" },
  { id: "approach", href: "/#approach", label: "Approach" },
  { id: "projects", href: "/#projects", label: "Projects" },
  { id: "contact", href: "/#contact", label: "Contact" },
];

function navItemClasses(isActive: boolean): string {
  return [
    "rounded-full px-4 py-2 text-sm transition-all duration-200",
    "hover:bg-accent/10 hover:text-foreground",
    "active:scale-95 active:bg-accent/20",
    isActive ? "bg-accent/15 text-foreground red-glow" : "text-muted",
  ].join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const onHomePage = pathname === "/";
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

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

      for (const section of sectionElements) {
        if (section.getBoundingClientRect().top <= anchorLine) {
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
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-full px-3 py-2 text-xs font-semibold tracking-[0.2em] text-foreground uppercase transition-all duration-200 hover:bg-accent/10 hover:text-accent active:scale-95 active:bg-accent/20 sm:text-sm"
        >
          Portfolio
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-surface/70 text-muted transition hover:bg-accent/10 hover:text-foreground active:scale-95 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-accent/20 bg-surface/75 px-2 py-1 backdrop-blur-md md:flex">
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
      </div>

      <div
        className={`mx-auto max-w-6xl px-4 pb-4 transition-all duration-200 sm:px-6 md:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <nav className="grid gap-2 rounded-2xl border border-accent/20 bg-surface/75 p-2 backdrop-blur-md">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.id}`}
              href={item.href}
              onClick={() => {
                setActiveSection(item.id);
                setMobileOpen(false);
              }}
              className={navItemClasses(item.id === activeSection)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
