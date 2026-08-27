import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  /** Set when a section uses aria-labelledby to point at this heading. */
  id?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  id,
  title,
  eyebrow,
  description,
  action,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-400">
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="font-display text-xl font-bold uppercase tracking-wide text-chalk sm:text-2xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-mist-400 text-balance-pretty">{description}</p>
        )}
        {children}
      </div>
      {action && (
        <Link
          href={action.href}
          className="-mr-2 inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-2 text-sm font-semibold text-mist-300 transition hover:text-gold-400"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
