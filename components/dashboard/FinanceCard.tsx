import type { FinanceSummary } from "@/types/database";

const PHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

interface FinanceCardProps {
  summary: FinanceSummary;
}

export default function FinanceCard({ summary }: FinanceCardProps) {
  const rows: { label: string; value: number; color: string }[] = [
    { label: "Revenue", value: summary.revenue, color: "text-accent-green" },
    { label: "Outstanding Balance", value: summary.outstanding, color: "text-accent-orange" },
    { label: "Refunds", value: summary.refunds, color: "text-accent-blue" },
    { label: "Cancellations", value: summary.cancellations, color: "text-accent-red" },
  ];

  const net = summary.revenue - summary.outstanding - summary.refunds - summary.cancellations;

  return (
    <div className="rounded-3xl bg-card-dark p-6 text-text-on-dark">
      <div className="text-xs uppercase tracking-[0.3em] text-text-on-dark/70">
        Finance Summary
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-text-on-dark/70">{row.label}</span>
            <span className={`font-semibold tabular-nums ${row.color}`}>
              {PHP(row.value)}
            </span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-sm">
          <span className="text-text-on-dark/70 font-medium">Net</span>
          <span className={`font-bold tabular-nums ${net >= 0 ? "text-accent-green" : "text-accent-red"}`}>
            {PHP(net)}
          </span>
        </div>
      </div>
    </div>
  );
}
