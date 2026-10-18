import { formatDate, formatMoney } from "@/lib/format";
import type { Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

export function paymentTotals(payments: Payment[]) {
  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  return { total, paid, outstanding: total - paid };
}

export function PaymentStatusPill({ status }: { status: Payment["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        status === "paid"
          ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20"
          : "bg-white/[0.04] text-zinc-400 ring-white/10",
      )}
    >
      {status === "paid" ? "Paid" : "Pending"}
    </span>
  );
}

export function PaymentList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No payment milestones yet. Your investigator will agree the scope and fees with you before
        any work is billed.
      </p>
    );
  }

  const { total, paid, outstanding } = paymentTotals(payments);

  return (
    <div>
      <ul className="divide-y divide-white/[0.06]">
        {payments.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-200">{p.milestone_name}</p>
              <p className="text-xs text-zinc-500">Added {formatDate(p.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="text-sm tabular-nums text-zinc-100">{formatMoney(Number(p.amount))}</span>
              <PaymentStatusPill status={p.status} />
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.03] p-3 text-center">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Total</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-zinc-100">{formatMoney(total)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Paid</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-emerald-300">{formatMoney(paid)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">Due</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-zinc-100">{formatMoney(outstanding)}</dd>
        </div>
      </dl>
    </div>
  );
}
