export const dynamic = "force-dynamic";

import SectionDivider from "@/components/ui/SectionDivider";
import GuestStatsCard from "@/components/dashboard/GuestStatsCard";
import FinanceCard from "@/components/dashboard/FinanceCard";
import WeatherBanner from "@/components/dashboard/WeatherBanner";
import { getGuestStats, getFinanceSummary, getReservationStats } from "@/lib/data/queries";

const PHP = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

export default async function SummaryPage() {
  const [guestStats, financeSummary, reservationStats] = await Promise.all([
    getGuestStats(),
    getFinanceSummary(),
    getReservationStats(),
  ]);

  const reservationCards = [
    { label: "Total Reservations", value: reservationStats.total.toLocaleString() },
    { label: "Approved", value: reservationStats.approved.toLocaleString() },
    { label: "Pending Approval", value: reservationStats.pending.toLocaleString() },
    { label: "Rejected", value: reservationStats.rejected.toLocaleString() },
    { label: "Total Guests Served", value: reservationStats.totalGuests.toLocaleString() },
    { label: "Revenue (Fully Paid)", value: PHP(reservationStats.totalRevenue) },
  ];

  return (
    <div className="space-y-8">
      <WeatherBanner />

      <div className="space-y-6">
        <SectionDivider label="Reservations" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reservationCards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-border bg-card-light p-5 shadow-sm"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
                {c.label}
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-text-on-light">
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <SectionDivider label="Guests" />
        <GuestStatsCard variant="detailed" stats={guestStats} />
      </div>

      <div className="space-y-6">
        <SectionDivider label="Finance" />
        <FinanceCard summary={financeSummary} />
      </div>
    </div>
  );
}
