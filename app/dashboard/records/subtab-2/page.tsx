import { getFinancialRecords } from "@/lib/data/queries";

const PHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

const typeStyles: Record<string, string> = {
  Revenue: "bg-accent-green/15 text-accent-green",
  "Outstanding Balance": "bg-accent-orange/15 text-accent-orange",
  Refund: "bg-accent-blue/15 text-accent-blue",
  Cancellation: "bg-accent-red/15 text-accent-red",
};

export default async function RecordsSubtab2Page() {
  const records = await getFinancialRecords();

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Financial Records</h1>
        <span className="text-sm text-text-muted">{records.length} entries</span>
      </div>

      {records.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No financial records found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-text-muted">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Reservation</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Reason</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.record_id} className="border-b border-border/50 hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 text-text-muted">{rec.record_date}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-text-muted">
                    {rec.reservations?.order_id ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${typeStyles[rec.record_type] ?? ""}`}>
                      {rec.record_type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-muted">{rec.reason ?? "—"}</td>
                  <td className="py-3 text-right tabular-nums font-medium">
                    {PHP(Number(rec.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
