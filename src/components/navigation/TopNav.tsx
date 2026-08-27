"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { LEAGUE_BRAND } from "@/lib/data/league-config";
import { NAV_ITEMS, isActive } from "./nav-items";

/**
 * Desktop navigation. Same information architecture as the mobile bar, just
 * laid out horizontally with the league wordmark as the home link.
 */
export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-white/8 bg-ink-950/85 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5 font-display text-lg font-extrabold uppercase tracking-tight"
        >
          <span className="text-chalk transition-colors group-hover:text-gold-400">
            {LEAGUE_BRAND.wordmarkTop}
          </span>
          <span className="text-gold-500">{LEAGUE_BRAND.wordmarkBottom}</span>
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                      active
                        ? "bg-gold-500/12 text-gold-400 ring-1 ring-gold-500/25"
                        : "text-mist-400 hover:bg-white/5 hover:text-chalk",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
