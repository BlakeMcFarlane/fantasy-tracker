"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEAGUE_BRAND } from "@/lib/data/league-config";

/**
 * Slim brand bar for inner pages on mobile. The Home page has the full hero, so
 * it is skipped there to avoid two wordmarks stacked on top of each other.
 */
export function MobileTopBar({ statusLabel }: { statusLabel?: string }) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="sticky top-0 z-40 border-b border-white/6 bg-ink-950/85 backdrop-blur-xl md:hidden">
      <div className="flex h-12 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-baseline gap-1 font-display text-sm font-extrabold uppercase tracking-tight"
        >
          <span className="text-chalk">{LEAGUE_BRAND.wordmarkTop}</span>
          <span className="text-gold-500">{LEAGUE_BRAND.wordmarkBottom}</span>
        </Link>
        {statusLabel && (
          <span className="rounded-full bg-white/6 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-mist-400">
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}
