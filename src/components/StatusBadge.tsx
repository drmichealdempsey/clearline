import { statusInfo } from "@/lib/constants";
import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<CaseStatus, string> = {
  received: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20",
  assigned: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  in_progress: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  report_ready: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  closed: "bg-white/[0.04] text-zinc-500 ring-white/10",
};

export function StatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {statusInfo(status).label}
    </span>
  );
}
