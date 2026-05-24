import { getReservationStats } from "@/lib/data/queries";

export default async function ReportsSubtab1Page() {
  const stats = await getReservationStats();

  const statCards = [
    { label: "Total Reservations", value: stats.total },
    { label: "Approved", value: stats.approved },
    { label: "Pending Approval", value: stats.pending },
    { label: "Rejected", value: stats.rejected },
    { label: "Total Guests Served", value: stats.totalGuests },
  ];

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Booking Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{card.label}</div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{card.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {Object.keys(stats.bySource).length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
            Bookings by Source
          </h2>
          <div className="mt-3 space-y-2">
            {Object.entries(stats.bySource)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={source}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{source}</span>
                      <span className="tabular-nums text-text-muted">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-accent-blue transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
