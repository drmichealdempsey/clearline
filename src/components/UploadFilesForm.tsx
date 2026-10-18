"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadCaseFile } from "@/lib/files";
import { FilePicker } from "@/components/FilePicker";

export function UploadFilesForm({ caseId, userId }: { caseId: string; userId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const failed: string[] = [];
    for (const file of files) {
      const err = await uploadCaseFile(supabase, { caseId, userId, file, kind: "supporting" });
      if (err) failed.push(file.name);
    }
    setUploading(false);
    setFiles(files.filter((f) => failed.includes(f.name)));
    if (failed.length) setError(`Could not upload: ${failed.join(", ")}. Please try again.`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <FilePicker files={files} onChange={setFiles} disabled={uploading} />
      {error && <p className="alert-error">{error}</p>}
      {files.length > 0 && (
        <div className="flex justify-end">
          <button type="button" className="btn-primary" onClick={upload} disabled={uploading}>
            {uploading ? "Uploading…" : `Upload ${files.length} file${files.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </div>
  );
}
