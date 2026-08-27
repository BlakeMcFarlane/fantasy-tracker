import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 pt-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading league data…</span>
      <Skeleton className="h-40 w-full rounded-card" />
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-card" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-tile" />
        ))}
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[4.5rem] w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
