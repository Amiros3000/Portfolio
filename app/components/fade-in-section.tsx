"use client";

import { motion } from "framer-motion";

type FadeInSectionProps = {
  children: React.ReactNode;
  delay?: number;
};

export default function FadeInSection({
  children,
  delay = 0,
}: FadeInSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
