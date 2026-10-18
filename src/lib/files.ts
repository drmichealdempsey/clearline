import type { SupabaseClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
import type { FileKind } from "./types";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_FILES = 10;
export const ACCEPTED_FILE_TYPES =
  "image/*,application/pdf,.doc,.docx,.txt,.rtf,.csv,.xls,.xlsx,.eml,.msg,.zip,video/mp4,video/quicktime,audio/*";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFiles(files: File[], max = MAX_FILES): string | null {
  if (files.length > max) return `You can attach up to ${max} files at a time.`;
  const tooBig = files.find((f) => f.size > MAX_FILE_BYTES);
  if (tooBig) return `"${tooBig.name}" is larger than ${formatBytes(MAX_FILE_BYTES)}.`;
  const empty = files.find((f) => f.size === 0);
  if (empty) return `"${empty.name}" is empty.`;
  return null;
}

export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned.slice(-120) || "file";
}

// Storage layout: supporting files at {caseId}/..., reports at {caseId}/reports/...
// The storage RLS policies in the migration depend on this layout.
export async function uploadCaseFile(
  supabase: SupabaseClient,
  opts: { caseId: string; userId: string; file: File; kind: FileKind },
): Promise<string | null> {
  const { caseId, userId, file, kind } = opts;
  const folder = kind === "report" ? `${caseId}/reports` : caseId;
  const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(siteConfig.storageBucket)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (uploadError) return uploadError.message;

  const { error: rowError } = await supabase.from("case_files").insert({
    case_id: caseId,
    uploaded_by: userId,
    file_path: path,
    file_name: file.name,
    kind,
  });
  return rowError ? rowError.message : null;
}
