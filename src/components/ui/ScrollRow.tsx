import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the scrollable region. */
  label: string;
  /**
   * Pull the row out to the screen edges. Turn this off when a parent already
   * bleeds, otherwise the gutters cancel out and the first item gets clipped.
   */
  bleed?: boolean;
}

/**
 * Touch-friendly horizontal list. Uses scroll snapping, keeps momentum
 * scrolling on iOS, hides the scrollbar, and fades the trailing edge so it is
 * obvious there is more to swipe to.
 */
export function ScrollRow({
  children,
  className,
  label,
  bleed = true,
}: ScrollRowProps) {
  return (
    <div className={cn("relative", bleed && "-mx-4 md:-mx-6")}>
      <div
        className={cn(
          // scroll-px keeps snap-start from swallowing the leading gutter.
          "scroll-row flex gap-2.5 px-4 pb-1 scroll-px-4 md:px-6 md:scroll-px-6",
          className,
        )}
        role="group"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-950 to-transparent"
        aria-hidden
      />
    </div>
  );
}
