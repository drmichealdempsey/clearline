"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/format";
import type { Payment } from "@/lib/types";
import { PaymentStatusPill, paymentTotals } from "@/components/PaymentList";
import { XIcon } from "@/components/icons";

export function PaymentsManager({ caseId, payments }: { caseId: string; payments: Payment[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, action: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(key);
    setError(null);
    const { error } = await action();
    setBusy(null);
    if (error) {
      setError(error.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!name.trim() || !Number.isFinite(value) || value < 0) {
      setError("Enter a milestone name and a valid amount.");
      return;
    }
    const supabase = createClient();
    const ok = await run("add", () =>
      supabase.from("payments").insert({
        case_id: caseId,
        milestone_name: name.trim(),
        amount: Math.round(value * 100) / 100,
      }),
    );
    if (ok) {
      setName("");
      setAmount("");
    }
  }

  function toggle(p: Payment) {
    const supabase = createClient();
    return run(p.id, () =>
      supabase
        .from("payments")
        .update({ status: p.status === "paid" ? "pending" : "paid" })
        .eq("id", p.id),
    );
  }

  function remove(p: Payment) {
    if (!window.confirm(`Delete milestone "${p.milestone_name}"?`)) return;
    const supabase = createClient();
    return run(p.id, () => supabase.from("payments").delete().eq("id", p.id));
  }

  const { total, paid } = paymentTotals(payments);

  return (
    <div className="space-y-5">
      {payments.length > 0 ? (
        <ul className="divide-y divide-white/[0.06]">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center gap-2 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-200">{p.milestone_name}</p>
                <p className="text-xs tabular-nums text-zinc-500">{formatMoney(Number(p.amount))}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(p)}
                disabled={busy === p.id}
                title={p.status === "paid" ? "Mark as pending" : "Mark as paid"}
                className="rounded-full transition hover:opacity-80 disabled:opacity-50"
              >
                <PaymentStatusPill status={p.status} />
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                disabled={busy === p.id}
                className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-red-300"
                aria-label={`Delete ${p.milestone_name}`}
              >
                <XIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No milestones yet.</p>
      )}

      {payments.length > 0 && (
        <p className="text-xs text-zinc-500">
          {formatMoney(paid)} paid of {formatMoney(total)}. Click a status to toggle it.
        </p>
      )}

      <form onSubmit={addMilestone} className="space-y-3 border-t border-white/[0.06] pt-5">
        <p className="text-sm font-medium text-zinc-200">Add milestone</p>
        <input
          className="input"
          placeholder="e.g. Initial retainer"
          value={name}
          maxLength={200}
          onChange={(e) => setName(e.target.value)}
          aria-label="Milestone name"
        />
        <div className="flex gap-2">
          <input
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount"
          />
          <button type="submit" className="btn-primary shrink-0" disabled={busy === "add"}>
            {busy === "add" ? "Adding…" : "Add"}
          </button>
        </div>
        {error && <p className="alert-error">{error}</p>}
      </form>
    </div>
  );
}
