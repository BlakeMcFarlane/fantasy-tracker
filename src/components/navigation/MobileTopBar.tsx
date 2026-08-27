"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminPath } from "./nav-items";
import { LEAGUE_BRAND } from "@/lib/data/league-config";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils/cn";

/**
 * Slim brand bar for inner pages on mobile. The Home page has the full hero and
 * the admin area has no chrome, so the bar is hidden there.
 *
 * Important: this always renders a single root element and hides itself with a
 * class, rather than returning `null`. A layout-level client component that
 * switches between `null` and an element across a soft navigation leaves a
 * duplicated "ghost" node in the App Router — which showed up as two stacked
 * headers after navigating away from Home. Keeping one stable element avoids it.
 */
export function MobileTopBar({ statusLabel }: { statusLabel?: string }) {
  const pathname = usePathname();
  const suppressed = pathname === "/" || isAdminPath(pathname);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b border-hairline bg-ink-950/85 backdrop-blur-xl md:hidden",
        suppressed && "hidden",
      )}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-baseline gap-1 font-display text-sm font-extrabold uppercase tracking-tight"
        >
          <span className="text-chalk">{LEAGUE_BRAND.wordmarkTop}</span>
          <span className="text-gold-400">{LEAGUE_BRAND.wordmarkBottom}</span>
        </Link>
        <div className="-mr-2 flex items-center gap-1.5">
          {statusLabel && (
            <span className="rounded-full bg-surface-hover px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-mist-400">
              {statusLabel}
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
