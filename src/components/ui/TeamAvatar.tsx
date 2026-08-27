"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { initialsFrom } from "@/lib/utils/format";

/**
 * Team logos on ESPN can point at any host a league member pasted in, so this
 * uses a plain lazy-loaded <img> and falls back to a generated monogram when
 * the URL is missing or fails to load.
 */

/**
 * Eleven options (a prime) so neighbouring seeds rarely repeat a colour.
 * Only the fixed 500/600 accent steps are used, so the monogram keeps its dark
 * `on-accent` text in both themes.
 */
const GRADIENTS = [
  "from-gold-500 to-gold-600",
  "from-turf-500 to-turf-600",
  "from-frost-500 to-frost-600",
  "from-flare-500 to-flare-600",
  "from-violet-500 to-violet-600",
  "from-gold-500 to-flare-500",
  "from-turf-500 to-frost-500",
  "from-flare-500 to-violet-500",
  "from-frost-500 to-turf-500",
  "from-violet-500 to-flare-500",
  "from-gold-600 to-turf-600",
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
  // The <img> is in the server HTML, so a broken URL can fail before React
  // hydrates and the onError listener never fires. Catch that on mount.
  const checkLoaded = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setFailed(true);
  }, []);
  const gradient = GRADIENTS[Math.abs(seed) % GRADIENTS.length];
  const showImage = Boolean(logoUrl) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        ring && "ring-1 ring-hairline-strong",
        SIZES[size],
        !showImage &&
          `bg-gradient-to-br ${gradient} font-display font-bold uppercase tracking-wide text-on-accent`,
        className,
      )}
      aria-hidden
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={checkLoaded}
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
