"use client";

import { Bell, List, ThermometerHigh } from "react-bootstrap-icons";
import { usePathname } from "next/navigation";
import { useLiveConditions } from "@/hooks/useLiveConditions";

interface TopBarProps {
  onMenuClick: () => void;
}

const FALLBACK_TIMEZONE = "Asia/Manila";
const FALLBACK_LOCATION = "Metro Manila";

function formatTemperature(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--°C";
  }
  return `${Math.round(value)}°C`;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const isSummary = pathname === "/dashboard/summary";

  const { conditions, now, error } = useLiveConditions();
  const timezone = conditions?.timezone || FALLBACK_TIMEZONE;
  const dayName = now.toLocaleDateString("en-US", { weekday: "long", timeZone: timezone });
  const dateLabel = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: timezone
  });
  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  });
  const weatherSummary = error
    ? "Live weather data unavailable."
    : conditions?.weatherSummary || "Loading live weather...";
  const weatherLabel = conditions?.weatherLabel || "Loading weather";
  const temperatureLabel = formatTemperature(conditions?.temperatureC);
  const locationLabel = conditions?.locationName || FALLBACK_LOCATION;
  const timezoneLabel = conditions?.timezoneAbbreviation || "GMT+8";

  if (!isSummary) {
    return (
      <header className="w-full bg-topbar text-text-on-dark md:hidden">
        <div className="flex items-center justify-between px-3 py-3 sm:px-6">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-full p-2"
            aria-label="Open sidebar"
          >
            <List size={20} />
          </button>
          <button type="button" className="rounded-full p-2" aria-label="Alerts">
            <Bell size={18} />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-topbar text-text-on-dark">
      <div className="flex items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
        {/* mobile: hamburger */}
        <div className="flex min-w-[2.75rem] items-center md:hidden">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-full p-2"
            aria-label="Open sidebar"
          >
            <List size={20} />
          </button>
        </div>

        {/* mobile: date/time center */}
        <div className="flex flex-1 items-center justify-center px-2 text-center md:hidden">
          <div className="text-center">
            <div className="text-sm font-semibold">{dayName}</div>
            <div className="text-[11px] text-text-on-dark/70">{dateLabel}</div>
            <div className="text-[11px] text-text-on-dark/60">{timeLabel}</div>
          </div>
        </div>

        {/* mobile: bell */}
        <div className="flex min-w-[2.75rem] items-center justify-end md:hidden">
          <button type="button" className="rounded-full p-2" aria-label="Alerts">
            <Bell size={18} />
          </button>
        </div>

        {/* desktop: full weather header */}
        <div className="hidden w-full items-center gap-8 md:flex">
          <div className="text-xs uppercase tracking-[0.4em] text-text-on-dark/70">
            Today
          </div>
          <div>
            <div className="text-2xl font-semibold">{dayName}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-accent-orange">
              <ThermometerHigh size={12} />
              {weatherSummary}
            </div>
          </div>
          <div>
            <div className="text-lg font-medium">{dateLabel}</div>
            <div className="text-xs text-text-on-dark/70">{weatherLabel}</div>
          </div>
          <div>
            <div className="text-lg font-medium">{timeLabel}</div>
            <div className="text-xs text-text-on-dark/70">{temperatureLabel}</div>
          </div>
          <div className="hidden lg:block">
            <div className="text-lg font-medium">{`${locationLabel} (${timezoneLabel})`}</div>
            <div className="text-xs text-text-on-dark/70">{timezone}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
