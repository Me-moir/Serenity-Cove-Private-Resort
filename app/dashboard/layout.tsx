"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarIconRail from "@/components/layout/SidebarIconRail";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const PRELOAD_NOW_ROUTES = [
  "/dashboard/summary",
  "/dashboard/calendar",
  "/dashboard/records/subtab-1",
  "/dashboard/cleaning/subtab-1",
  "/dashboard/reports/subtab-1",
  "/dashboard/flags/subtab-1",
  "/dashboard/changelog/subtab-1",
  "/dashboard/profile/subtab-1",
  "/dashboard/settings/subtab-1"
];

const PRELOAD_IDLE_ROUTES = [
  "/dashboard/records/subtab-2",
  "/dashboard/records/subtab-3",
  "/dashboard/cleaning/subtab-2",
  "/dashboard/cleaning/subtab-3",
  "/dashboard/reports/subtab-2",
  "/dashboard/reports/subtab-3",
  "/dashboard/flags/subtab-2",
  "/dashboard/flags/subtab-3",
  "/dashboard/changelog/subtab-2",
  "/dashboard/changelog/subtab-3",
  "/dashboard/profile/subtab-2",
  "/dashboard/profile/subtab-3",
  "/dashboard/settings/subtab-2",
  "/dashboard/settings/subtab-3",
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
      return "CleaningSchedule";
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
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
