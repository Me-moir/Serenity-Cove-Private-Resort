import SectionDivider from "@/components/ui/SectionDivider";
import GuestStatsCard from "@/components/dashboard/GuestStatsCard";
import FinanceCard from "@/components/dashboard/FinanceCard";
import WeatherBanner from "@/components/dashboard/WeatherBanner";

export default function SummaryPage() {
  return (
    <div className="space-y-8">
      <WeatherBanner />

      <div className="space-y-6">
        <SectionDivider label="Guests" />
        <div className="grid gap-4 lg:grid-cols-2">
          <GuestStatsCard variant="detailed" />
          <GuestStatsCard variant="simple" />
        </div>
      </div>

      <div className="space-y-6">
        <SectionDivider label="Finance" />
        <FinanceCard />
      </div>
    </div>
  );
}
