import { getFinanceSummary, getFinancialRecords } from "@/lib/data/queries";

const PHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function ReportsSubtab2Page() {
  const [summary, records] = await Promise.all([getFinanceSummary(), getFinancialRecords()]);

  const net = summary.revenue - summary.outstanding - summary.refunds - summary.cancellations;

  const byMonth: Record<string, { revenue: number; refunds: number; cancellations: number }> = {};
  for (const rec of records) {
    const month = rec.record_date.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = { revenue: 0, refunds: 0, cancellations: 0 };
    if (rec.record_type === "Revenue") byMonth[month].revenue += Number(rec.amount);
    else if (rec.record_type === "Refund") byMonth[month].refunds += Number(rec.amount);
    else if (rec.record_type === "Cancellation") byMonth[month].cancellations += Number(rec.amount);
  }

  const months = Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Revenue Report</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: summary.revenue, color: "text-accent-green" },
            { label: "Outstanding", value: summary.outstanding, color: "text-accent-orange" },
            { label: "Refunds", value: summary.refunds, color: "text-accent-blue" },
            { label: "Cancellations", value: summary.cancellations, color: "text-accent-red" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{item.label}</div>
              <div className={`mt-2 text-2xl font-bold tabular-nums ${item.color}`}>
                {PHP(item.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-border p-4 flex items-center justify-between">
          <span className="text-sm font-medium">Net</span>
          <span className={`text-2xl font-bold tabular-nums ${net >= 0 ? "text-accent-green" : "text-accent-red"}`}>
            {PHP(net)}
          </span>
        </div>
      </div>

      {months.length > 0 && (
        <div className="rounded-3xl bg-card-light p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly Breakdown</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-text-muted">
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 pr-4 text-right">Revenue</th>
                  <th className="pb-3 pr-4 text-right">Refunds</th>
                  <th className="pb-3 text-right">Cancellations</th>
                </tr>
              </thead>
              <tbody>
                {months.map(([month, data]) => (
                  <tr key={month} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">{month}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-accent-green">{PHP(data.revenue)}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-accent-blue">{PHP(data.refunds)}</td>
                    <td className="py-3 text-right tabular-nums text-accent-red">{PHP(data.cancellations)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
