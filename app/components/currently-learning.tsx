"use client";

import { motion } from "framer-motion";

const learningItems = [
  "AWS",
  "TypeScript",
  "Next.js",
  "Kubernetes",
  "CI/CD Pipelines",
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const pill = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function CurrentlyLearning() {
  return (
    <div className="rounded-3xl border border-accent/20 bg-surface/55 p-5 backdrop-blur-md sm:p-6">
      <p className="mb-3 text-xs tracking-[0.16em] text-secondary uppercase">
        Currently Exploring
      </p>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {learningItems.map((item) => (
          <motion.span
            key={item}
            variants={pill}
            className="rounded-full border border-secondary/25 bg-secondary/8 px-3 py-1.5 text-sm font-medium text-foreground transition-transform hover:scale-105"
          >
            {item}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
