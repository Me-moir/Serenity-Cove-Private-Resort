interface GuestStatsCardProps {
  variant: "detailed" | "simple";
}

export default function GuestStatsCard({ variant }: GuestStatsCardProps) {
  return (
    <div className="rounded-3xl bg-card-dark p-6 text-text-on-dark">
      <div className="text-xs uppercase tracking-[0.3em] text-text-on-dark/70">
        Total Guests
      </div>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="text-5xl font-bold tracking-tight">1,999</div>
        {variant === "detailed" ? (
          <div className="flex flex-1 gap-6 lg:border-l lg:border-white/20 lg:pl-6">
            <div className="text-sm text-text-on-dark/70">
              <div>999 Adult Men</div>
              <div>1000 Adult Women</div>
            </div>
            <div className="text-sm text-text-on-dark/70">
              <div>390 Children</div>
              <div>99 VIP</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
