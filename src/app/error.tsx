"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-16">
      <EmptyState
        icon={<TriangleAlert className="h-5 w-5" />}
        title="Fumble"
        message="Something went wrong loading this page. It's probably temporary — give it another shot."
        action={
          <Button onClick={reset} size="sm">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        }
      />
    </div>
  );
}
