"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import {
  BarChart,
  ClockHistory,
  Tools,
  Flag,
  Gear,
  Grid1x2,
  House,
  Moon,
  PersonCircle,
  Sun
} from "react-bootstrap-icons";
import { useTheme } from "@/components/theme/ThemeProvider";

const topTabs = [
  {
    id: "HomeDashboard",
    href: "/dashboard/summary",
    icon: House,
    label: "Home Dashboard"
  },
  {
    id: "RecordsManagement",
    href: "/dashboard/records/subtab-1",
    icon: Grid1x2,
    label: "Records"
  },
  {
    id: "Maintenance",
    href: "/dashboard/cleaning/subtab-1",
    icon: Tools,
    label: "Maintenance"
  },
  {
    id: "ReportsAnalytics",
    href: "/dashboard/reports/subtab-1",
    icon: BarChart,
    label: "Reports"
  }
];

const bottomTabs = [
  { id: "FlagsMonitoring", href: "/dashboard/flags/subtab-1", icon: Flag, label: "Flags" },
  {
    id: "ChangelogHistory",
    href: "/dashboard/changelog/subtab-1",
    icon: ClockHistory,
    label: "Changelog"
  },
  { id: "AdminProfile", href: "/dashboard/profile/subtab-1", icon: PersonCircle, label: "Profile" },
  { id: "DashboardSettings", href: "/dashboard/settings/subtab-1", icon: Gear, label: "Settings" }
];

interface SidebarIconRailProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export default function SidebarIconRail({
  activeTab,
  onSelectTab
}: SidebarIconRailProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);

  const showTooltip = (e: MouseEvent<HTMLAnchorElement>, label: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, x: rect.right + 8, y: rect.top + rect.height / 2 });
  };

  const hideTooltip = () => setTooltip(null);
  const currentPathTab = pathname.startsWith("/dashboard/records")
    ? "RecordsManagement"
    : pathname.startsWith("/dashboard/cleaning")
    ? "CleaningSchedule"
    : pathname.startsWith("/dashboard/reports")
    ? "ReportsAnalytics"
    : pathname.startsWith("/dashboard/flags")
    ? "FlagsMonitoring"
    : pathname.startsWith("/dashboard/changelog")
    ? "ChangelogHistory"
    : pathname.startsWith("/dashboard/profile")
    ? "AdminProfile"
    : pathname.startsWith("/dashboard/settings")
    ? "DashboardSettings"
    : "HomeDashboard";
  const activeIndex = topTabs.findIndex((tab) => tab.id === activeTab);
  const railStep = 44;

  useEffect(() => {
    [...topTabs, ...bottomTabs].forEach((tab) => {
      router.prefetch(tab.href);
    });
  }, [router]);

  return (
    <>
    <aside className="sticky top-0 hidden h-dvh w-20 self-start overscroll-none bg-shell px-3 py-4 lg:flex lg:h-screen">
      <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-rail px-2 py-4 shadow-sm">
        <div className="flex flex-col items-center rounded-3xl bg-surface-soft p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-topbar">
            <Image
              src="/icons/sc-logo.png"
              alt="SC logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              priority
            />
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
              const shouldStayOnCurrentPath = currentPathTab === tab.id;
              const destinationHref = shouldStayOnCurrentPath ? pathname : tab.href;
              const handleTopTabClick = (event: MouseEvent<HTMLAnchorElement>) => {
                if (shouldStayOnCurrentPath) {
                  event.preventDefault();
                }

                onSelectTab(tab.id);
              };

              return (
                <Link
                  key={tab.label}
                  href={destinationHref}
                  prefetch
                  onClick={handleTopTabClick}
                  onMouseEnter={(e) => showTooltip(e, tab.label)}
                  onMouseLeave={hideTooltip}
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

        <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-soft p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const shouldStayOnCurrentPath = currentPathTab === tab.id;
            const destinationHref = shouldStayOnCurrentPath ? pathname : tab.href;
            const handleBottomTabClick = (event: MouseEvent<HTMLAnchorElement>) => {
              if (shouldStayOnCurrentPath) {
                event.preventDefault();
              }

              onSelectTab(tab.id);
            };

            return (
              <Link
                key={tab.label}
                href={destinationHref}
                prefetch
                onClick={handleBottomTabClick}
                onMouseEnter={(e) => showTooltip(e, tab.label)}
                onMouseLeave={hideTooltip}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition ${
                  isActive
                    ? "bg-topbar text-text-on-dark"
                    : "text-text-on-light hover:bg-surface-soft-hover"
                }`}
                aria-label={tab.label}
                aria-pressed={isActive}
              >
                <Icon size={18} />
              </Link>
            );
          })}

          <div className="mt-2 flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft-hover text-text-on-light transition hover:scale-105"
              aria-label={
                resolvedTheme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div>
    </aside>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-lg bg-topbar px-2.5 py-1 text-xs font-medium text-text-on-dark shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}
