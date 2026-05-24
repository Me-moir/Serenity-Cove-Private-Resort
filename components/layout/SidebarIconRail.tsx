"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { MouseEvent } from "react";
import {
  BarChart,
  CalendarCheck,
  ClockHistory,
  Flag,
  Gear,
  Grid1x2,
  House,
  ListTask,
  Moon,
  PersonCircle
} from "react-bootstrap-icons";

const topTabs = [
  { id: "HomeDashboard", href: "/dashboard/summary", icon: House, label: "Home" },
  { id: "RecordsManagement", href: "/dashboard/records", icon: Grid1x2, label: "Records" },
  { id: "CleaningSchedule", href: "/dashboard/cleaning", icon: CalendarCheck, label: "Cleaning" },
  { id: "ReportsAnalytics", href: "/dashboard/reports", icon: BarChart, label: "Reports" }
];

const bottomLinks = [
  { href: "/dashboard/summary", icon: Flag, label: "Flags" },
  { href: "/dashboard/summary", icon: ClockHistory, label: "Changelog" },
  { href: "/dashboard/summary", icon: PersonCircle, label: "Profile" },
  { href: "/dashboard/summary", icon: Gear, label: "Settings" }
];

interface SidebarIconRailProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export default function SidebarIconRail({
  activeTab,
  onSelectTab
}: SidebarIconRailProps) {
  const router = useRouter();
  const activeIndex = topTabs.findIndex((tab) => tab.id === activeTab);
  const railStep = 44;

  useEffect(() => {
    topTabs.forEach((tab) => {
      router.prefetch(tab.href);
    });
  }, [router]);

  return (
    <aside className="hidden h-screen w-20 bg-shell px-3 py-4 lg:flex">
      <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-rail px-2 py-4 shadow-sm">
          <div className="flex flex-col items-center rounded-3xl bg-white/70 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-topbar text-[9px] font-semibold uppercase tracking-[0.3em] text-text-on-dark">
              HD
            </div>
            <div className="my-2 h-px w-9 bg-border" />
            <div className="relative flex flex-col items-center gap-2">
              {activeIndex >= 0 ? (
                <span
                  className="pointer-events-none absolute left-0 right-0 h-9 rounded-md bg-topbar transition-transform duration-200 ease-out"
                  style={{
                    transform: `translateY(${activeIndex * railStep}px)`
                  }}
                >
                  <span className="absolute inset-y-1 -left-2 w-1 bg-[#22D3C5]" />
                </span>
              ) : null}
              {topTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const handleTopTabClick = (event: MouseEvent<HTMLAnchorElement>) => {
                  if (isActive) {
                    event.preventDefault();
                  }

                  onSelectTab(tab.id);
                };

                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    prefetch
                    onClick={handleTopTabClick}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-md border border-transparent ${
                      isActive ? "text-text-on-dark" : "text-text-on-light"
                    }`}
                    aria-label={tab.label}
                    aria-pressed={isActive}
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>

        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/70 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-text-on-light transition hover:bg-white"
                aria-label={link.label}
              >
                <Icon size={18} />
              </Link>
            );
          })}

          <div className="mt-2 flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
            <span>Switch</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-on-light">
              <Moon size={14} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
