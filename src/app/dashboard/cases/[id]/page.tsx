import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireRole } from "@/lib/auth";
import { isReportReleased, serviceName, statusInfo } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Case, CaseFile, CaseUpdate, Payment } from "@/lib/types";
import { DownloadButton, FileList } from "@/components/FileList";
import { PaymentList } from "@/components/PaymentList";
import { PostUpdateForm } from "@/components/PostUpdateForm";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusProgress } from "@/components/StatusProgress";
import { Timeline } from "@/components/Timeline";
import { UploadFilesForm } from "@/components/UploadFilesForm";
import { ArrowLeftIcon, FileIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Case", robots: { index: false } };

export default async function ClientCasePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { submitted?: string; failed?: string };
}) {
  const { supabase, user } = await requireRole("client");

  const { data: caseRow } = await supabase
    .from("cases")
    .select("*")
    .eq("id", params.id)
    .eq("client_id", user.id)
    .maybeSingle();
  if (!caseRow) notFound();
  const c = caseRow as Case;

  const [updatesRes, filesRes, paymentsRes] = await Promise.all([
    supabase.from("case_updates").select("*").eq("case_id", c.id).order("created_at", { ascending: false }),
    supabase.from("case_files").select("*").eq("case_id", c.id).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("case_id", c.id).order("created_at", { ascending: true }),
  ]);

  const updates = (updatesRes.data ?? []) as CaseUpdate[];
  const files = (filesRes.data ?? []) as CaseFile[];
  const payments = (paymentsRes.data ?? []) as Payment[];

  const reports = files.filter((f) => f.kind === "report");
  const supporting = files.filter((f) => f.kind === "supporting");
  const released = isReportReleased(c.status);
  const isClosed = c.status === "closed";
  const failed = Number(searchParams.failed ?? 0);

  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100">
        <ArrowLeftIcon width={16} height={16} />
        All cases
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{serviceName(c.service_type)}</p>
          <h1 className="mt-2 break-words font-display text-2xl tracking-tight sm:text-3xl">{c.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">Opened {formatDate(c.created_at)}</p>
        </div>
        <StatusBadge status={c.status} className="self-start" />
      </div>

      {searchParams.submitted === "1" && (
        <p className="alert-success mt-6">
          Your case has been received. An investigator will review it and post an update here.
        </p>
      )}
      {failed > 0 && (
        <p className="alert-error mt-3">
          {failed} file{failed === 1 ? "" : "s"} could not be uploaded. You can add them again under
          Files below.
        </p>
      )}

      <section className="card mt-6 p-5 sm:p-6">
        <StatusProgress status={c.status} />
        <p className="mt-4 text-sm text-zinc-400">{statusInfo(c.status).clientDescription}</p>
      </section>

      {released && reports.length > 0 && (
        <section className="card mt-6 border-brass-400/30 bg-gradient-to-br from-brass-400/[0.08] to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brass-400/15 text-brass-300">
                <FileIcon />
              </span>
              <div>
                <h2 className="text-base font-semibold">Your final report is ready</h2>
                <p className="text-sm text-zinc-400">
                  Download links are private and expire shortly after they are created.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              {reports.map((r) => (
                <DownloadButton key={r.id} file={r} className="btn-primary btn-sm">
                  {reports.length > 1 ? r.file_name : "Download report"}
                </DownloadButton>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Your request</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">
              {c.description}
            </p>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-5 text-base font-semibold">Updates</h2>
            <Timeline
              items={updates.map((u) => ({
                ...u,
                author: u.author_id === user.id ? "You" : `${siteConfig.shortName} team`,
                fromTeam: u.author_id !== user.id,
              }))}
            />
            {!isClosed && (
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <PostUpdateForm
                  caseId={c.id}
                  userId={user.id}
                  label="Send a message to your investigator"
                  placeholder="Share new information or ask a question…"
                  submitLabel="Send"
                />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Files you shared</h2>
            <FileList files={supporting} emptyText="You haven't shared any files yet." />
            {!isClosed && (
              <div className="mt-5 border-t border-white/[0.06] pt-5">
                <UploadFilesForm caseId={c.id} userId={user.id} />
              </div>
            )}
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Payment milestones</h2>
            <PaymentList payments={payments} />
            {payments.length > 0 && (
              <p className="mt-3 text-xs text-zinc-500">
                Your investigator will confirm here when a payment has been received.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
