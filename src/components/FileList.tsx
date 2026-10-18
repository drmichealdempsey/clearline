"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import type { CaseFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DownloadIcon, FileIcon } from "@/components/icons";

// Files live in a private bucket; downloads go through short-lived signed URLs,
// which Supabase only issues if the storage RLS policies allow the read.
export function DownloadButton({
  file,
  className,
  children,
}: {
  file: Pick<CaseFile, "file_path" | "file_name">;
  className?: string;
  children?: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function download() {
    setBusy(true);
    setError(false);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(siteConfig.storageBucket)
      .createSignedUrl(file.file_path, 60, { download: file.file_name });
    setBusy(false);
    if (error || !data) {
      setError(true);
      return;
    }
    window.location.assign(data.signedUrl);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className={cn("btn-secondary btn-sm", className)}
      title={error ? "Download failed, try again" : `Download ${file.file_name}`}
    >
      <DownloadIcon width={14} height={14} />
      {busy ? "Preparing…" : error ? "Retry" : (children ?? "Download")}
    </button>
  );
}

export function FileList({
  files,
  emptyText = "No files yet.",
  showKind = false,
}: {
  files: CaseFile[];
  emptyText?: string;
  showKind?: boolean;
}) {
  if (files.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {files.map((file) => (
        <li key={file.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-zinc-400">
            <FileIcon width={16} height={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-zinc-200" title={file.file_name}>
              {file.file_name}
            </p>
            <p className="text-xs text-zinc-500">
              {formatDate(file.created_at)}
              {showKind && file.kind === "report" && (
                <span className="ml-2 rounded bg-brass-400/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brass-300">
                  Report
                </span>
              )}
            </p>
          </div>
          <DownloadButton file={file} />
        </li>
      ))}
    </ul>
  );
}
