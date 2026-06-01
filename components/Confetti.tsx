"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["#14b8a6", "#fbbf24", "#f43f5e", "#a855f7", "#22d3ee", "#84cc16"];
const PARTICLES = 36;

export function Confetti({ show, durationMs = 2400 }: { show: boolean; durationMs?: number }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [show, durationMs]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: PARTICLES }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function Particle({ index }: { index: number }) {
  // Deterministic pseudo-random based on index so SSR matches
  const seed = (n: number) => ((Math.sin(index * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const color = COLORS[index % COLORS.length];
  const x = seed(1) * 100; // % left
  const xEnd = x + (seed(2) - 0.5) * 40;
  const duration = 1.6 + seed(3) * 1.2;
  const delay = seed(4) * 0.2;
  const rot = (seed(5) - 0.5) * 720;
  const size = 6 + seed(6) * 8;

  return (
    <motion.span
      initial={{ top: "-10%", left: `${x}%`, rotate: 0, opacity: 1 }}
      animate={{ top: "110%", left: `${xEnd}%`, rotate: rot, opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  );
}
