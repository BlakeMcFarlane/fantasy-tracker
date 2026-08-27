"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, isActive } from "./nav-items";

/**
 * Persistent mobile navigation. Sits above the home indicator on iPhones via
 * the safe-area inset, and every target is a full-height 56px+ tap area.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-ink-900/92 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 transition-colors duration-200",
                  active ? "text-gold-400" : "text-mist-500 hover:text-mist-300",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0 h-0.5 rounded-full bg-gold-400 transition-all duration-300 ease-out",
                    active ? "w-8 opacity-100" : "w-0 opacity-0",
                  )}
                  aria-hidden
                />
                <Icon
                  className={cn(
                    "h-[1.375rem] w-[1.375rem] transition-transform duration-200",
                    active && "scale-110",
                  )}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden
                />
                <span className="text-[0.6875rem] font-semibold tracking-wide">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
