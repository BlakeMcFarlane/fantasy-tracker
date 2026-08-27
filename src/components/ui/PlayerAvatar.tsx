"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { initialsFrom } from "@/lib/utils/format";

interface PlayerAvatarProps {
  name: string;
  /** Kept for the alt text / future position-specific art. */
  position?: string;
  headshotUrl?: string | null;
  className?: string;
}

/**
 * Headshots come from a.espncdn.com (configured in next.config.ts) so they go
 * through Next's image optimiser. Anything missing falls back to a tinted
 * position chip, which keeps the row height stable.
 */
export function PlayerAvatar({ name, headshotUrl, className }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const canShow = Boolean(headshotUrl) && !failed;

  return (
    <span
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700 ring-1 ring-white/8",
        className,
      )}
      aria-hidden
    >
      {canShow ? (
        <Image
          src={headshotUrl!}
          alt=""
          width={44}
          height={44}
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
          unoptimized={false}
        />
      ) : (
        <span
          className="font-display text-xs font-bold uppercase tracking-wide text-mist-400"
          aria-hidden
        >
          {initialsFrom(name)}
        </span>
      )}
    </span>
  );
}
