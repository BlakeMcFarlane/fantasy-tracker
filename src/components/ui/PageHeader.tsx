import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("pt-2 pb-5", className)}>
      {eyebrow && (
        <p className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-500">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-[2rem] font-extrabold uppercase leading-[0.95] tracking-tight text-chalk sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-mist-400 text-balance-pretty">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
