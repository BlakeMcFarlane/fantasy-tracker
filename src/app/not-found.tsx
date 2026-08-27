import { MapPinOff } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="pt-16">
      <EmptyState
        icon={<MapPinOff className="h-5 w-5" />}
        title="Out of bounds"
        message="This page isn't part of the league. Let's get you back to the action."
        action={
          <ButtonLink href="/" size="sm">
            Back to Home
          </ButtonLink>
        }
      />
    </div>
  );
}
