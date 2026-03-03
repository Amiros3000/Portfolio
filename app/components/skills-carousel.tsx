"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type SkillGroup = {
  title: string;
  items: string[];
};

const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: [
      "Python",
      "Java (Object-Oriented Design)",
      "SQL",
      "Bash",
      "JavaScript (ES6+)",
    ],
  },
  {
    title: "Backend & Web",
    items: ["Node.js", "Express", "RESTful APIs", "MySQL", "React.js"],
  },
  {
    title: "Infrastructure & Tools",
    items: [
      "Linux/Unix",
      "Docker",
      "Git/GitHub",
      "TCP/IP",
      "HTTP/DNS",
      "Distributed Systems Concepts",
    ],
  },
  {
    title: "Core Coursework",
    items: [
      "Object-Oriented Programming (Java)",
      "Data Structures & Algorithms",
      "Operating Systems",
      "Communication Networks",
      "Software Engineering Principles",
    ],
  },
];

export default function SkillsCarousel() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [maxDrag, setMaxDrag] = useState(0);

  useEffect(() => {
    const updateDragBounds = () => {
      if (!viewportRef.current) return;
      const max = viewportRef.current.scrollWidth - viewportRef.current.offsetWidth;
      setMaxDrag(Math.max(0, max));
    };

    updateDragBounds();
    window.addEventListener("resize", updateDragBounds);

    return () => {
      window.removeEventListener("resize", updateDragBounds);
    };
  }, []);

  return (
    <section id="skills" className="mx-auto mt-8 max-w-6xl px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs tracking-[0.16em] text-muted uppercase">Skills</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          Skills Carousel
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Drag to explore core tools and technologies across backend and systems engineering.
        </p>
      </div>

      <div
        ref={viewportRef}
        className="overflow-hidden rounded-3xl border border-accent bg-surface/55 p-3 backdrop-blur-md"
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          whileTap={{ cursor: "grabbing" }}
          className="flex cursor-grab gap-4"
        >
          {skillGroups.map((group) => (
            <motion.article
              key={group.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="min-w-[280px] rounded-3xl border border-accent bg-surface/55 p-5 backdrop-blur-md md:min-w-[320px]"
            >
              <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-accent/60 bg-surface-strong/70 px-3 py-1 text-xs text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
