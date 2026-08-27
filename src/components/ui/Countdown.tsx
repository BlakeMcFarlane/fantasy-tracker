"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { timeRemaining } from "@/lib/utils/dates";

interface CountdownProps {
  target: string;
  /** `Date.now()` from the server render — keeps hydration in sync. */
  serverNow: number;
  size?: "sm" | "lg";
  className?: string;
  onComplete?: string;
}

const UNITS = ["Days", "Hrs", "Min", "Sec"] as const;

export function Countdown({
  target,
  serverNow,
  size = "lg",
  className,
  onComplete = "It's happening",
}: CountdownProps) {
  // First client render must match the server, so start from `serverNow` and
  // only switch to the live clock after mount.
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    // First sync happens on the next frame rather than during the effect body,
    // then once a second after that.
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);

  const remaining = timeRemaining(target, now);

  if (remaining.isPast) {
    return (
      <p
        className={cn(
          "font-display font-bold uppercase tracking-wide text-turf-400",
          size === "lg" ? "text-2xl" : "text-base",
          className,
        )}
      >
        {onComplete}
      </p>
    );
  }

  const values = [
    remaining.days,
    remaining.hours,
    remaining.minutes,
    remaining.seconds,
  ];

  return (
    <div
      className={cn("flex items-start", size === "lg" ? "gap-2.5" : "gap-1.5", className)}
      role="timer"
      aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes remaining`}
    >
      {UNITS.map((unit, index) => (
        <div key={unit} className="flex items-start">
          <div className="text-center">
            <div
              className={cn(
                "font-display font-bold tnum leading-none text-chalk",
                size === "lg" ? "text-3xl sm:text-4xl" : "text-lg",
              )}
            >
              {String(values[index]).padStart(2, "0")}
            </div>
            <div
              className={cn(
                "mt-1 font-semibold uppercase tracking-[0.12em] text-mist-500",
                size === "lg" ? "text-[0.625rem]" : "text-[0.5625rem]",
              )}
            >
              {unit}
            </div>
          </div>
          {index < UNITS.length - 1 && (
            <span
              className={cn(
                "font-display font-bold leading-none text-ink-500",
                size === "lg" ? "ml-2.5 text-3xl sm:text-4xl" : "ml-1.5 text-lg",
              )}
              aria-hidden
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
