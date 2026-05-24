"use client";

import { Bell, List, ThermometerHigh } from "react-bootstrap-icons";
import { useClock } from "@/hooks/useClock";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const time = useClock();
  const displayDate = time;
  const dayName = displayDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = displayDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const timeLabel = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <header className="w-full bg-topbar text-text-on-dark">
      <div className="flex items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
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

        <div className="flex flex-1 items-center justify-center px-2 text-center md:hidden">
          <div className="text-center">
            <div className="text-sm font-semibold">{dayName}</div>
            <div className="text-[11px] text-text-on-dark/70">{dateLabel}</div>
            <div className="text-[11px] text-text-on-dark/60">{timeLabel}</div>
          </div>
        </div>

        <div className="flex min-w-[2.75rem] items-center justify-end md:hidden">
          <button type="button" className="rounded-full p-2" aria-label="Alerts">
            <Bell size={18} />
          </button>
        </div>

        <div className="hidden w-full items-center gap-8 md:flex">
          <div className="text-xs uppercase tracking-[0.4em] text-text-on-dark/70">
            Today
          </div>
          <div>
            <div className="text-2xl font-semibold">{dayName}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-accent-orange">
              <ThermometerHigh size={12} />
              Weather alert: Heat advisory
            </div>
          </div>
          <div>
            <div className="text-lg font-medium">{dateLabel}</div>
            <div className="text-xs text-text-on-dark/70">Partly sunny</div>
          </div>
          <div>
            <div className="text-lg font-medium">{timeLabel}</div>
            <div className="text-xs text-text-on-dark/70">32 degree C</div>
          </div>
          <div className="hidden lg:block">
            <div className="text-lg font-medium">Metro Manila (GMT+8)</div>
            <div className="text-xs text-text-on-dark/70">
              Philippine Standard Time
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
