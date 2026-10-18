import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  message: string;
  created_at: string;
  author: string;
  fromTeam: boolean;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No updates yet.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-white/[0.08] pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              "absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-ink-900",
              item.fromTeam ? "bg-brass-400" : "bg-zinc-500",
            )}
            aria-hidden
          />
          <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
            <span className={cn("font-medium", item.fromTeam ? "text-brass-300" : "text-zinc-300")}>
              {item.author}
            </span>
            <time className="text-zinc-500" dateTime={item.created_at}>
              {formatDateTime(item.created_at)}
            </time>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200">
            {item.message}
          </p>
        </li>
      ))}
    </ol>
  );
}
