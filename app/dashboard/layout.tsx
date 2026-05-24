"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarIconRail from "@/components/layout/SidebarIconRail";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
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
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-none [overscroll-behavior-y:none] [-webkit-overflow-scrolling:touch] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
