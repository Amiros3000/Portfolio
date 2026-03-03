"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = {
  id: string;
  href: string;
  label: string;
};

const homeNavItems: NavItem[] = [
  { id: "skills", href: "/#skills", label: "Skills" },
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

  const navItems = useMemo(() => {
    if (!onHomePage) {
      return [{ id: "home", href: "/", label: "Home" }];
    }

    return homeNavItems;
  }, [onHomePage]);

  useEffect(() => {
    if (!onHomePage) {
      setActiveSection("");
      return;
    }

    const sectionElements = homeNavItems
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        setActiveSection(visible[0].target.id);
      },
      {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.2, 0.35, 0.5, 0.75],
      },
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [onHomePage]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="rounded-full px-3 py-2 text-sm font-semibold tracking-[0.16em] text-foreground uppercase transition-all duration-200 hover:bg-accent/10 hover:text-accent active:scale-95 active:bg-accent/20"
        >
          Portfolio
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-accent/20 bg-surface/75 px-2 py-1 backdrop-blur-md">
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

          <Link
            href="/admin"
            className="rounded-full border border-accent/20 bg-surface/70 px-4 py-2 text-sm text-muted transition-all duration-200 hover:bg-accent/10 hover:text-foreground active:scale-95"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
