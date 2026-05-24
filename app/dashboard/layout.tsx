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

  return (
    <div className="min-h-screen bg-shell text-text-on-light">
      <div className="flex min-h-screen">
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
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
