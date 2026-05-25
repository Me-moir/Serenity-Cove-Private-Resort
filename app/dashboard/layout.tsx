"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarIconRail from "@/components/layout/SidebarIconRail";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { StaffAssignmentProvider } from "@/components/providers/StaffAssignmentProvider";

const PRELOAD_NOW_ROUTES = [
  "/dashboard/summary",
  "/dashboard/calendar",
  "/dashboard/records/guest-records",
  "/dashboard/cleaning/venue-overview",
  "/dashboard/reports/occupancy-reports",
  "/dashboard/flags/system-flags",
  "/dashboard/changelog/recent-updates",
  "/dashboard/profile/personal-information",
  "/dashboard/settings/general-settings"
];

const PRELOAD_IDLE_ROUTES = [
  "/dashboard/records/financial-records",
  "/dashboard/records/incidents",
  "/dashboard/records/reservation-records",
  "/dashboard/cleaning/room-inspection",
  "/dashboard/cleaning/venue-preparation",
  "/dashboard/reports/revenue-reports",
  "/dashboard/reports/guest-analytics",
  "/dashboard/flags/crash-downtime",
  "/dashboard/flags/traffic-monitor",
  "/dashboard/changelog/patches",
  "/dashboard/changelog/revamps",
  "/dashboard/profile/password-security",
  "/dashboard/profile/activity-logs",
  "/dashboard/settings/system-integrations",
  "/dashboard/settings/preferences",
  "/dashboard/reservation",
  "/dashboard/guests",
  "/dashboard/staff-task",
  "/dashboard/reviews"
];

function shouldSkipAggressivePreload() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
    }
  ).connection;

  if (!connection) {
    return false;
  }

  if (connection.saveData) {
    return true;
  }

  return Boolean(connection.effectiveType?.includes("2g"));
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [optimisticMainTab, setOptimisticMainTab] = useState<string | null>(null);
  const pathname = usePathname();
  const activeMainTab = useMemo(() => {
    if (pathname.startsWith("/dashboard/records")) {
      return "RecordsManagement";
    }

    if (pathname.startsWith("/dashboard/cleaning")) {
      return "Maintenance";
    }

    if (pathname.startsWith("/dashboard/reports")) {
      return "ReportsAnalytics";
    }

    if (pathname.startsWith("/dashboard/flags")) {
      return "FlagsMonitoring";
    }

    if (pathname.startsWith("/dashboard/changelog")) {
      return "ChangelogHistory";
    }

    if (pathname.startsWith("/dashboard/profile")) {
      return "AdminProfile";
    }

    if (pathname.startsWith("/dashboard/settings")) {
      return "DashboardSettings";
    }

    return "HomeDashboard";
  }, [pathname]);
  const displayedMainTab = optimisticMainTab ?? activeMainTab;

  useEffect(() => {
    if (optimisticMainTab === activeMainTab) {
      setOptimisticMainTab(null);
    }
  }, [optimisticMainTab, activeMainTab]);

  useEffect(() => {
    const root = document.documentElement;
    const previousRootOverscrollY = root.style.overscrollBehaviorY;
    const previousBodyOverscrollY = document.body.style.overscrollBehaviorY;

    root.style.overscrollBehaviorY = "none";
    document.body.style.overscrollBehaviorY = "none";

    return () => {
      root.style.overscrollBehaviorY = previousRootOverscrollY;
      document.body.style.overscrollBehaviorY = previousBodyOverscrollY;
    };
  }, []);

  useEffect(() => {
    const prefetch = (route: string) => {
      if (route !== pathname) {
        router.prefetch(route);
      }
    };

    PRELOAD_NOW_ROUTES.forEach(prefetch);

    if (shouldSkipAggressivePreload()) {
      return;
    }

    const queue = PRELOAD_IDLE_ROUTES.filter((route) => route !== pathname);
    let isCancelled = false;
    let timeoutId: number | undefined;

    const runNextBatch = () => {
      if (isCancelled || queue.length === 0) {
        return;
      }

      queue.splice(0, 3).forEach((route) => {
        router.prefetch(route);
      });

      if (queue.length > 0) {
        timeoutId = window.setTimeout(runNextBatch, 220);
      }
    };

    timeoutId = window.setTimeout(runNextBatch, 900);

    return () => {
      isCancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname, router]);

  return (
    <div className="h-dvh overflow-hidden bg-shell text-text-on-light md:h-screen">
      <div className="flex h-full overflow-hidden overscroll-none">
        <SidebarIconRail
          activeTab={displayedMainTab}
          onSelectTab={(tab) => {
            setOptimisticMainTab(tab);
            setIsSidebarCollapsed(false);
          }}
        />
        <Sidebar
          isMobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          activeMainTab={displayedMainTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-none [-webkit-overflow-scrolling:touch] p-4 sm:p-6 lg:p-8">
            <StaffAssignmentProvider>
              {children}
            </StaffAssignmentProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
