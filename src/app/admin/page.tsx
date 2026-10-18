import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { CASE_STATUSES, SERVICES, isCaseStatus, isServiceType, serviceName } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Case, CaseStatus, Profile } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Case console", robots: { index: false } };

type CaseRow = Case & { client: Pick<Profile, "full_name" | "email"> | null };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string; service?: string; q?: string };
}) {
  const { supabase } = await requireRole("investigator");

  const status = isCaseStatus(searchParams.status) ? searchParams.status : null;
  const service = isServiceType(searchParams.service) ? searchParams.service : null;
  // Strip characters that have meaning in PostgREST filter syntax.
  const q = (searchParams.q ?? "").replace(/[,()%_*\\]/g, " ").trim().slice(0, 100);

  let query = supabase
    .from("cases")
    .select("*, client:profiles(full_name, email)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  if (service) query = query.eq("service_type", service);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const [{ data, error }, { data: statusRows }] = await Promise.all([
    query,
    supabase.from("cases").select("status"),
  ]);
  const cases = (data ?? []) as CaseRow[];

  const counts = (statusRows ?? []).reduce<Record<CaseStatus, number>>(
    (acc, row) => {
      acc[row.status as CaseStatus]++;
      return acc;
    },
    { received: 0, assigned: 0, in_progress: 0, report_ready: 0, closed: 0 },
  );
  const filtered = Boolean(status || service || q);

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Investigator</p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">Case console</h1>

      {/* Status counts double as quick filters */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CASE_STATUSES.map((s) => (
          <Link
            key={s.id}
            href={status === s.id ? "/admin" : `/admin?status=${s.id}`}
            className={`card p-4 transition hover:border-white/15 ${status === s.id ? "border-brass-400/40" : ""}`}
          >
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-50">{counts[s.id]}</p>
          </Link>
        ))}
      </div>

      {/* Filters: a plain GET form so it works without client JS */}
      <form method="get" className="card mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="q">
            Search
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Title or description" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className="input">
            <option value="">All statuses</option>
            {CASE_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="service">
            Service
          </label>
          <select id="service" name="service" defaultValue={service ?? ""} className="input">
            <option value="">All services</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 sm:flex-none">
            Apply
          </button>
          {filtered && (
            <Link href="/admin" className="btn-ghost">
              Clear
            </Link>
          )}
        </div>
      </form>

      {error && <p className="alert-error mt-6">Could not load cases: {error.message}</p>}

      <p className="mt-6 text-sm text-zinc-500">
        {cases.length} case{cases.length === 1 ? "" : "s"}
        {filtered ? " matching filters" : ""}
      </p>

      {cases.length === 0 ? (
        <div className="card mt-3 p-8 text-center text-sm text-zinc-400">No cases found.</div>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="mt-3 space-y-3 md:hidden">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/cases/${c.id}`} className="card block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium text-zinc-100">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-400">
                    {c.client?.full_name || c.client?.email || "Unknown client"}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {serviceName(c.service_type)} · Updated {formatDate(c.updated_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="card mt-3 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Case</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3" aria-label="Open" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {cases.map((c) => (
                  <tr key={c.id} className="transition hover:bg-white/[0.02]">
                    <td className="max-w-[260px] px-5 py-4">
                      <Link href={`/admin/cases/${c.id}`} className="block truncate font-medium text-zinc-100 hover:text-brass-300">
                        {c.title}
                      </Link>
                      <span className="text-xs text-zinc-500">Opened {formatDate(c.created_at)}</span>
                    </td>
                    <td className="max-w-[220px] px-5 py-4">
                      <p className="truncate text-zinc-200">{c.client?.full_name || "—"}</p>
                      <p className="truncate text-xs text-zinc-500">{c.client?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-300">{serviceName(c.service_type)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-zinc-400">{formatDate(c.updated_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="inline-flex items-center gap-1 text-brass-300 hover:text-brass-200"
                      >
                        Open <ArrowRightIcon width={14} height={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
