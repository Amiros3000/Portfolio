"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProjectCarouselProps = {
  images: string[];
  alt: string;
};

export default function ProjectCarousel({ images, alt }: ProjectCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + images.length) % images.length);
    },
    [images.length],
  );

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-surface/80">
        <img
          src={images[0]}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden bg-surface/80">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={index}
          src={images[index]}
          alt={`${alt} — ${index + 1} of ${images.length}`}
          loading="lazy"
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Prev / Next arrows — visible on hover */}
      <button
        onClick={(e) => {
          e.preventDefault();
          paginate(-1);
        }}
        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/70 group-hover:opacity-100"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          paginate(1);
        }}
        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/70 group-hover:opacity-100"
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index
                ? "w-4 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
