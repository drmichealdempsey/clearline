import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { serviceName } from "@/lib/constants";
import { firstName, formatDate } from "@/lib/format";
import type { Case, CaseUpdate } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusProgress } from "@/components/StatusProgress";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "My cases", robots: { index: false } };

type CaseWithLatest = Case & { case_updates: Pick<CaseUpdate, "id" | "message" | "created_at">[] };

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireRole("client");

  const { data } = await supabase
    .from("cases")
    .select("*, case_updates(id, message, created_at)")
    .eq("client_id", user.id)
    .order("updated_at", { ascending: false })
    .order("created_at", { referencedTable: "case_updates", ascending: false })
    .limit(1, { referencedTable: "case_updates" });

  const cases = (data ?? []) as CaseWithLatest[];
  const name = firstName(profile?.full_name);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Client portal</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">
            {name ? `Hello, ${name}` : "Your cases"}
          </h1>
        </div>
        <Link href="/start" className="btn-secondary">
          Start a new case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-lg font-semibold">No cases yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            When you submit a request it will appear here, along with updates from your investigator.
          </p>
          <Link href="/start" className="btn-primary mt-6">
            Start a Case
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {cases.map((c) => {
            const latest = c.case_updates[0];
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/cases/${c.id}`}
                  className="card group block p-5 transition hover:border-brass-400/25 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">{serviceName(c.service_type)}</p>
                      <h2 className="mt-1 truncate text-base font-semibold">{c.title}</h2>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-5">
                    <StatusProgress status={c.status} compact />
                  </div>
                  <p className="mt-5 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
                    {latest ? latest.message : "No updates yet. We'll post here as soon as your case is reviewed."}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>Opened {formatDate(c.created_at)}</span>
                    <span className="flex items-center gap-1 text-brass-300 opacity-80 transition group-hover:opacity-100">
                      View case <ArrowRightIcon width={14} height={14} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
