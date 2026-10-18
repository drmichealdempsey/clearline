"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PostUpdateForm({
  caseId,
  userId,
  label = "Add a message",
  placeholder = "Write a message…",
  submitLabel = "Post",
}: {
  caseId: string;
  userId: string;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("case_updates")
      .insert({ case_id: caseId, author_id: userId, message: text });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="label" htmlFor={`update-${caseId}`}>
        {label}
      </label>
      <textarea
        id={`update-${caseId}`}
        className="input min-h-[96px] resize-y"
        placeholder={placeholder}
        value={message}
        maxLength={5000}
        onChange={(e) => setMessage(e.target.value)}
        disabled={saving}
      />
      {error && <p className="alert-error">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving || !message.trim()}>
          {saving ? "Posting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
