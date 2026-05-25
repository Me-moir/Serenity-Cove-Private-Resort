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
      {/* Mobile row */}
      <div className="flex items-center justify-between px-3 py-3 sm:px-6 md:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-full p-2"
          aria-label="Open sidebar"
        >
          <List size={20} />
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold">{dayName}</div>
          <div className="text-[11px] text-text-on-dark/70">{dateLabel}</div>
          <div className="text-[11px] text-text-on-dark/60">{timeLabel}</div>
        </div>
        <button type="button" className="rounded-full p-2" aria-label="Alerts">
          <Bell size={18} />
        </button>
      </div>

      {/* Desktop row — equal-width columns */}
      <div className="hidden w-full md:flex">
        {/* Today */}
        <div className="flex flex-1 flex-col items-center justify-center border-r border-white/[0.08] px-4 py-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-text-on-dark/50">Today</span>
        </div>
        {/* Day + weather summary */}
        <div className="flex flex-1 flex-col items-center justify-center border-r border-white/[0.08] px-4 py-4 text-center">
          <div className="text-xl font-semibold leading-tight">{dayName}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-accent-orange">
            <ThermometerHigh size={11} />
            <span className="line-clamp-1">{weatherSummary}</span>
          </div>
        </div>
        {/* Date + weather label */}
        <div className="flex flex-1 flex-col items-center justify-center border-r border-white/[0.08] px-4 py-4 text-center">
          <div className="text-base font-medium leading-tight">{dateLabel}</div>
          <div className="mt-1 text-[11px] text-text-on-dark/60">{weatherLabel}</div>
        </div>
        {/* Time + temperature */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 text-center lg:border-r lg:border-white/[0.08]">
          <div className="text-base font-medium leading-tight">{timeLabel}</div>
          <div className="mt-1 text-[11px] text-text-on-dark/60">{temperatureLabel}</div>
        </div>
        {/* Location + timezone — only on lg+ */}
        <div className="hidden flex-1 flex-col items-center justify-center px-4 py-4 text-center lg:flex">
          <div className="text-base font-medium leading-tight">{`${locationLabel} (${timezoneLabel})`}</div>
          <div className="mt-1 text-[11px] text-text-on-dark/60">{timezone}</div>
        </div>
      </div>
    </header>
  );
}
