import SectionDivider from "@/components/ui/SectionDivider";
import GuestStatsCard from "@/components/dashboard/GuestStatsCard";
import FinanceCard from "@/components/dashboard/FinanceCard";
import WeatherBanner from "@/components/dashboard/WeatherBanner";
import { getGuestStats, getFinanceSummary } from "@/lib/data/queries";

export default async function SummaryPage() {
  const [guestStats, financeSummary] = await Promise.all([
    getGuestStats(),
    getFinanceSummary(),
  ]);

  return (
    <div className="space-y-8">
      <WeatherBanner />

      <div className="space-y-6">
        <SectionDivider label="Guests" />
        <div className="grid gap-4 lg:grid-cols-2">
          <GuestStatsCard variant="detailed" stats={guestStats} />
          <GuestStatsCard variant="simple" stats={guestStats} />
        </div>
      </div>

      <div className="space-y-6">
        <SectionDivider label="Finance" />
        <FinanceCard summary={financeSummary} />
      </div>
    </div>
  );
}
