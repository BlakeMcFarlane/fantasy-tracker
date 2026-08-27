import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card bg-ink-850/70 text-center ring-1 ring-white/6",
        compact ? "px-5 py-8" : "px-6 py-12",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-700 text-mist-400 ring-1 ring-white/8">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-bold uppercase tracking-wide text-chalk">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-mist-400 text-balance-pretty">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
