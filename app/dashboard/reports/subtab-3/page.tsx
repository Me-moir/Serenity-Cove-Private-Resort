export const dynamic = "force-dynamic";

import { getGuestStats, getGuests } from "@/lib/data/queries";

export default async function ReportsSubtab3Page() {
  const [stats, guests] = await Promise.all([getGuestStats(), getGuests()]);

  const topGuests = guests
    .filter((g) => g.total_bookings > 0)
    .sort((a, b) => b.total_bookings - a.total_bookings)
    .slice(0, 10);

  const typePercent = (count: number) =>
    stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Guest Report</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "New Guests", value: stats.new, color: "bg-accent-blue" },
            { label: "Returning Guests", value: stats.returning, color: "bg-accent-green" },
            { label: "VIP Guests", value: stats.vip, color: "bg-accent-orange" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{item.label}</div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{item.value.toLocaleString()}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${typePercent(item.value)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-text-muted">{typePercent(item.value)}% of total</div>
            </div>
          ))}
        </div>
      </div>

      {topGuests.length > 0 && (
        <div className="rounded-3xl bg-card-light p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Top Guests by Bookings</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-text-muted">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4 text-right">Bookings</th>
                  <th className="pb-3">Last Stay</th>
                </tr>
              </thead>
              <tbody>
                {topGuests.map((guest, i) => (
                  <tr key={guest.guest_id} className="border-b border-border/50">
                    <td className="py-3 pr-4 text-text-muted">{i + 1}</td>
                    <td className="py-3 pr-4 font-medium">{guest.first_name} {guest.last_name}</td>
                    <td className="py-3 pr-4 text-text-muted">{guest.guest_type}</td>
                    <td className="py-3 pr-4 text-right tabular-nums font-semibold">{guest.total_bookings}</td>
                    <td className="py-3 text-text-muted">{guest.last_stay ?? "—"}</td>
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
