import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-on-accent hover:bg-gold-400 active:bg-gold-600 font-semibold shadow-gold",
  secondary:
    "bg-ink-700 text-chalk hover:bg-ink-600 active:bg-ink-750 ring-1 ring-hairline-strong",
  ghost: "text-mist-300 hover:text-chalk hover:bg-surface-hover",
};

const SIZES: Record<Size, string> = {
  // Minimum 44px tall so every control is an easy thumb target.
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full transition duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-45 disabled:pointer-events-none select-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
    >
      {children}
    </Link>
  );
}
