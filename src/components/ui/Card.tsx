import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardTone = "default" | "raised" | "gold" | "outline" | "ghost";

const TONES: Record<CardTone, string> = {
  default: "bg-ink-850 ring-1 ring-hairline shadow-card",
  raised: "bg-ink-800 ring-1 ring-hairline shadow-lift",
  gold: "bg-gradient-to-br from-gold-500/16 via-ink-850 to-ink-900 ring-1 ring-gold-500/25 shadow-card",
  outline: "bg-ink-900/60 ring-1 ring-hairline",
  ghost: "bg-transparent",
};

interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: CardTone;
  interactive?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

export function Card({
  tone = "default",
  interactive = false,
  as: Component = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-card",
        TONES[tone],
        interactive &&
          "transition duration-200 ease-out hover:ring-hairline-strong hover:shadow-lift active:scale-[0.985] motion-reduce:active:scale-100",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function CardBody({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 sm:p-5", className)} {...rest}>
      {children}
    </div>
  );
}
