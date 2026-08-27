"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils/cn";

/**
 * Icon-only theme switch. Lives inside existing chrome (the desktop header and
 * the mobile title bar) rather than taking a navigation slot.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-mist-400 transition-colors duration-200",
        "hover:bg-surface-hover hover:text-chalk",
        className,
      )}
    >
      {/* Both icons render; only one is visible, so there is no hydration
          mismatch and no icon pop-in on first paint. */}
      <Sun
        className={cn("h-[1.15rem] w-[1.15rem]", isLight && "hidden")}
        aria-hidden
      />
      <Moon
        className={cn("h-[1.15rem] w-[1.15rem]", !isLight && "hidden")}
        aria-hidden
      />
    </button>
  );
}
