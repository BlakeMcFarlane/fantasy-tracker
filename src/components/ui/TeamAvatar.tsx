"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { initialsFrom } from "@/lib/utils/format";

/**
 * Team logos on ESPN can point at any host a league member pasted in, so this
 * uses a plain lazy-loaded <img> and falls back to a generated monogram when
 * the URL is missing or fails to load.
 */

// Eleven options (a prime) so neighbouring seeds rarely repeat a colour.
const GRADIENTS = [
  "from-gold-400 to-gold-600",
  "from-turf-400 to-turf-600",
  "from-frost-500 to-frost-400",
  "from-flare-500 to-flare-400",
  "from-violet-400 to-frost-500",
  "from-gold-500 to-flare-500",
  "from-turf-500 to-frost-500",
  "from-flare-400 to-violet-400",
  "from-frost-400 to-turf-400",
  "from-violet-400 to-flare-500",
  "from-gold-300 to-turf-500",
];

const SIZES = {
  xs: "h-8 w-8 text-[0.5625rem]",
  sm: "h-10 w-10 text-[0.6875rem]",
  md: "h-12 w-12 text-xs",
  lg: "h-16 w-16 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

interface TeamAvatarProps {
  name: string;
  logoUrl?: string | null;
  seed?: number;
  size?: keyof typeof SIZES;
  className?: string;
  ring?: boolean;
}

export function TeamAvatar({
  name,
  logoUrl,
  seed = 0,
  size = "md",
  className,
  ring = true,
}: TeamAvatarProps) {
  const [failed, setFailed] = useState(false);
  const gradient = GRADIENTS[Math.abs(seed) % GRADIENTS.length];
  const showImage = Boolean(logoUrl) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        ring && "ring-1 ring-white/12",
        SIZES[size],
        !showImage &&
          `bg-gradient-to-br ${gradient} font-display font-bold uppercase tracking-wide text-ink-950`,
        className,
      )}
      aria-hidden
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl!}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initialsFrom(name)
      )}
    </span>
  );
}
