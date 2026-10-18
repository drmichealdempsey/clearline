import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { serviceName } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Case, CaseFile, CaseUpdate, Payment, Profile } from "@/lib/types";
import { FileList } from "@/components/FileList";
import { PostUpdateForm } from "@/components/PostUpdateForm";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusProgress } from "@/components/StatusProgress";
import { Timeline } from "@/components/Timeline";
import { ArrowLeftIcon } from "@/components/icons";
import { PaymentsManager } from "./PaymentsManager";
import { ReportUploadForm } from "./ReportUploadForm";
import { StatusForm } from "./StatusForm";

export const metadata: Metadata = { title: "Case", robots: { index: false } };

type AdminCase = Case & { client: Pick<Profile, "full_name" | "email" | "created_at"> | null };
type UpdateWithAuthor = CaseUpdate & { author: Pick<Profile, "full_name" | "email" | "role"> | null };

export default async function AdminCasePage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireRole("investigator");

  const { data: caseRow } = await supabase
    .from("cases")
    .select("*, client:profiles(full_name, email, created_at)")
    .eq("id", params.id)
    .maybeSingle();
  if (!caseRow) notFound();
  const c = caseRow as AdminCase;

  const [updatesRes, filesRes, paymentsRes] = await Promise.all([
    supabase
      .from("case_updates")
      .select("*, author:profiles(full_name, email, role)")
      .eq("case_id", c.id)
      .order("created_at", { ascending: false }),
    supabase.from("case_files").select("*").eq("case_id", c.id).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("case_id", c.id).order("created_at", { ascending: true }),
  ]);

  const updates = (updatesRes.data ?? []) as UpdateWithAuthor[];
  const files = (filesRes.data ?? []) as CaseFile[];
  const payments = (paymentsRes.data ?? []) as Payment[];

  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100">
        <ArrowLeftIcon width={16} height={16} />
        All cases
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{serviceName(c.service_type)}</p>
          <h1 className="mt-2 break-words font-display text-2xl tracking-tight sm:text-3xl">{c.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Opened {formatDateTime(c.created_at)} · Last activity {formatDateTime(c.updated_at)}
          </p>
        </div>
        <StatusBadge status={c.status} className="self-start" />
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <StatusProgress status={c.status} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Client&apos;s request</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">
              {c.description}
            </p>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Post an update</h2>
            <p className="mb-4 mt-1 text-xs text-zinc-500">Visible to the client in their timeline.</p>
            <PostUpdateForm
              caseId={c.id}
              userId={user.id}
              label="Message"
              placeholder="Progress, next steps, requests for information…"
              submitLabel="Post update"
            />
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-5 text-base font-semibold">Timeline</h2>
            <Timeline
              items={updates.map((u) => {
                const fromTeam = u.author?.role === "investigator";
                const name = u.author?.full_name || u.author?.email || "Unknown";
                return { ...u, fromTeam, author: fromTeam ? name : `${name} (client)` };
              })}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Client</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Name</dt>
                <dd className="text-zinc-100">{c.client?.full_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Email</dt>
                <dd className="break-all">
                  {c.client?.email ? (
                    <a href={`mailto:${c.client.email}`} className="text-brass-300 hover:underline">
                      {c.client.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {c.client?.created_at && (
                <div>
                  <dt className="text-xs text-zinc-500">Client since</dt>
                  <dd className="text-zinc-300">{formatDate(c.client.created_at)}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Status</h2>
            <StatusForm caseId={c.id} userId={user.id} current={c.status} />
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Final report</h2>
            <p className="mb-4 mt-1 text-xs text-zinc-500">
              Reports are hidden from the client until the case is Report ready or Closed.
            </p>
            <ReportUploadForm caseId={c.id} userId={user.id} currentStatus={c.status} />
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Payment milestones</h2>
            <PaymentsManager caseId={c.id} payments={payments} />
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Files</h2>
            <FileList files={files} showKind emptyText="No files on this case yet." />
          </section>
        </div>
      </div>
    </div>
  );
}
