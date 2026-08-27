"use client";

import { cn } from "@/lib/utils/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex rounded-full bg-ink-800 p-1 ring-1 ring-white/8",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 rounded-full px-3.5 text-xs font-bold uppercase tracking-wide transition duration-200",
              selected
                ? "bg-gold-500 text-ink-950 shadow-sm"
                : "text-mist-400 hover:text-chalk",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
