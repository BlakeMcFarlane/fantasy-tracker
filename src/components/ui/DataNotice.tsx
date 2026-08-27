import { AlertTriangle, FlaskConical } from "lucide-react";
import type { DataSource } from "@/types/league";

interface DataNoticeProps {
  source: DataSource;
  error: string | null;
}

/**
 * Honest labelling: whenever the numbers on screen are not live ESPN data, say
 * so. Renders nothing on the happy path.
 */
export function DataNotice({ source, error }: DataNoticeProps) {
  if (source === "demo") {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl bg-frost-500/8 px-3.5 py-3 text-sm ring-1 ring-frost-500/20">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-frost-400" aria-hidden />
        <p className="text-mist-300">
          <span className="font-semibold text-frost-400">Demo data.</span>{" "}
          Sample teams and scores so you can see how the season will look. Connect
          the ESPN league to replace this with real numbers.
        </p>
      </div>
    );
  }

  if (source === "none" && error) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl bg-gold-500/8 px-3.5 py-3 text-sm ring-1 ring-gold-500/20">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
        <p className="text-mist-300">{error}</p>
      </div>
    );
  }

  return null;
}
