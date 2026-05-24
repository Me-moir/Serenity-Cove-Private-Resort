import type { GuestStats } from "@/types/database";

interface GuestStatsCardProps {
  variant: "detailed" | "simple";
  stats: GuestStats;
}

export default function GuestStatsCard({ variant, stats }: GuestStatsCardProps) {
  return (
    <div className="rounded-3xl bg-card-dark p-6 text-text-on-dark">
      <div className="text-xs uppercase tracking-[0.3em] text-text-on-dark/70">
        Total Guests
      </div>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="text-5xl font-bold tracking-tight">
          {stats.total.toLocaleString()}
        </div>
        {variant === "detailed" ? (
          <div className="flex flex-1 gap-6 lg:border-l lg:border-white/20 lg:pl-6">
            <div className="text-sm text-text-on-dark/70">
              <div>{stats.new.toLocaleString()} New</div>
              <div>{stats.returning.toLocaleString()} Returning</div>
            </div>
            <div className="text-sm text-text-on-dark/70">
              <div>{stats.vip.toLocaleString()} VIP</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
