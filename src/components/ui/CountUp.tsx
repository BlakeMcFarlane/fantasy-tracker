"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  durationMs?: number;
  prefix?: string;
  className?: string;
}

/**
 * Counts a number up on first paint. Falls straight to the final value when the
 * visitor prefers reduced motion, and renders the final value on the server so
 * the figure is always in the HTML.
 */
export function CountUp({
  value,
  durationMs = 900,
  prefix = "",
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    // State already holds the final value, so reduced-motion needs no work and
    // the server-rendered HTML always contains the real number.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let start: number | null = null;

    const tick = (time: number) => {
      if (start === null) start = time;
      const progress = Math.min(1, (time - start) / durationMs);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value, durationMs]);

  return (
    <span className={className}>
      {prefix}
      {display.toLocaleString("en-US")}
    </span>
  );
}
