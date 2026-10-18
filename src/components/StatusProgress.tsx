import { CASE_STATUSES, statusIndex, statusInfo } from "@/lib/constants";
import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusProgress({
  status,
  compact = false,
}: {
  status: CaseStatus;
  compact?: boolean;
}) {
  const index = statusIndex(status);
  const total = CASE_STATUSES.length;
  const percent = Math.max(4, (index / (total - 1)) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-zinc-500">
          Step {index + 1} of {total}
        </span>
        <span className="font-medium text-brass-300">{statusInfo(status).label}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label="Case progress"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brass-600 via-brass-400 to-brass-300 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {!compact && (
        <ol className="mt-3 hidden grid-cols-5 gap-2 sm:grid">
          {CASE_STATUSES.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "text-[11px] leading-tight",
                i < index && "text-zinc-400",
                i === index && "font-medium text-zinc-100",
                i > index && "text-zinc-600",
                i === total - 1 && "text-right",
                i > 0 && i < total - 1 && "text-center",
              )}
            >
              {s.label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
