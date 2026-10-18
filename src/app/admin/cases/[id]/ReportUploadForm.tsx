"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadCaseFile } from "@/lib/files";
import type { CaseStatus } from "@/lib/types";
import { FilePicker } from "@/components/FilePicker";

export function ReportUploadForm({
  caseId,
  userId,
  currentStatus,
}: {
  caseId: string;
  userId: string;
  currentStatus: CaseStatus;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const alreadyReleased = currentStatus === "report_ready" || currentStatus === "closed";
  const [markReady, setMarkReady] = useState(!alreadyReleased);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function upload() {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setDone(false);
    const supabase = createClient();

    const uploadError = await uploadCaseFile(supabase, { caseId, userId, file, kind: "report" });
    if (uploadError) {
      setUploading(false);
      setError(uploadError);
      return;
    }

    if (markReady && !alreadyReleased) {
      const { error: statusError } = await supabase
        .from("cases")
        .update({ status: "report_ready" })
        .eq("id", caseId);
      if (statusError) {
        setUploading(false);
        setError(`Report uploaded, but the status could not be updated: ${statusError.message}`);
        router.refresh();
        return;
      }
      await supabase.from("case_updates").insert({
        case_id: caseId,
        author_id: userId,
        message: "Your final report is ready. You can download it from the top of this page.",
      });
    }

    setUploading(false);
    setFiles([]);
    setDone(true);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <FilePicker
        files={files}
        onChange={setFiles}
        multiple={false}
        disabled={uploading}
        hint="PDF recommended · up to 25 MB"
      />
      {!alreadyReleased && (
        <label className="flex items-start gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={markReady}
            onChange={(e) => setMarkReady(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-ink-850 accent-brass-400"
          />
          Set status to Report ready and notify the client
        </label>
      )}
      {error && <p className="alert-error">{error}</p>}
      {done && <p className="alert-success">Report uploaded.</p>}
      <button
        type="button"
        className="btn-primary w-full"
        onClick={upload}
        disabled={uploading || files.length === 0}
      >
        {uploading ? "Uploading…" : "Upload report"}
      </button>
    </div>
  );
}
