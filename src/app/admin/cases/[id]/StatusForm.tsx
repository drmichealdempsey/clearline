"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CASE_STATUSES, statusInfo } from "@/lib/constants";
import type { CaseStatus } from "@/lib/types";

export function StatusForm({
  caseId,
  userId,
  current,
}: {
  caseId: string;
  userId: string;
  current: CaseStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<CaseStatus>(current);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === current) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase.from("cases").update({ status }).eq("id", caseId);
    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    // Record the change in the client-visible timeline.
    const message = [`Status changed to “${statusInfo(status).label}”.`, note.trim()]
      .filter(Boolean)
      .join("\n\n");
    await supabase.from("case_updates").insert({ case_id: caseId, author_id: userId, message });

    setSaving(false);
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        className="input"
        value={status}
        onChange={(e) => setStatus(e.target.value as CaseStatus)}
        disabled={saving}
        aria-label="Case status"
      >
        {CASE_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      {status !== current && (
        <textarea
          className="input min-h-[72px]"
          placeholder="Optional note for the client"
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
          disabled={saving}
        />
      )}
      {error && <p className="alert-error">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={saving || status === current}>
        {saving ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}
