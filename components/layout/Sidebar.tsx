"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Calendar3,
  CalendarCheck,
  Clipboard,
  ClockHistory,
  ExclamationTriangle,
  FileEarmarkCheck,
  Flag,
  Gear,
  Grid1x2,
  House,
  PersonCircle,
  PersonLinesFill,
  ListCheck,
  People,
  Receipt,
  Star,
  X,
  LayoutSidebar,
  QuestionCircle,
  Telephone
} from "react-bootstrap-icons";
import Badge from "@/components/ui/Badge";
import CommandMenu from "@/components/layout/CommandMenu";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  activeMainTab: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface SidebarNavItem {
  label: string;
  href?: string;
  icon: typeof Clipboard;
  badge?: string;
}

interface MainTabNavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Clipboard;
}

const homeNavItems: SidebarNavItem[] = [
  { label: "Summary", href: "/dashboard/summary", icon: Clipboard, badge: "3" },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar3 },
  {
    label: "Reservation",
    href: "/dashboard/reservation",
    icon: FileEarmarkCheck,
    badge: "7"
  },
  { label: "Guests", href: "/dashboard/guests", icon: People },
  { label: "Staff Task", href: "/dashboard/staff-task", icon: ListCheck, badge: "2" },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star }
];

const recordsNavItems: SidebarNavItem[] = [
  { label: "Customer Records", href: "/dashboard/records/subtab-1", icon: PersonLinesFill },
  { label: "Reservation Records", href: "/dashboard/records/subtab-4", icon: FileEarmarkCheck },
  { label: "Financial Records", href: "/dashboard/records/subtab-2", icon: Receipt },
  { label: "Incidents", href: "/dashboard/records/subtab-3", icon: ExclamationTriangle }
];

const cleaningNavItems: SidebarNavItem[] = [
  { label: "Subtab 1", href: "/dashboard/cleaning/subtab-1", icon: Clipboard },
  { label: "Subtab 2", href: "/dashboard/cleaning/subtab-2", icon: Clipboard },
  { label: "Subtab 3", href: "/dashboard/cleaning/subtab-3", icon: Clipboard }
];

const reportsNavItems: SidebarNavItem[] = [
  { label: "Subtab 1", href: "/dashboard/reports/subtab-1", icon: Clipboard },
  { label: "Subtab 2", href: "/dashboard/reports/subtab-2", icon: Clipboard },
  { label: "Subtab 3", href: "/dashboard/reports/subtab-3", icon: Clipboard }
];

const flagsNavItems: SidebarNavItem[] = [
  { label: "System Flags", href: "/dashboard/flags/subtab-1", icon: Clipboard },
  { label: "Crash & Downtime", href: "/dashboard/flags/subtab-2", icon: Clipboard },
  { label: "Traffic Monitor", href: "/dashboard/flags/subtab-3", icon: Clipboard }
];

const changelogNavItems: SidebarNavItem[] = [
  { label: "Recent Updates", href: "/dashboard/changelog/subtab-1", icon: Clipboard },
  { label: "Patches", href: "/dashboard/changelog/subtab-2", icon: Clipboard },
  { label: "Revamps", href: "/dashboard/changelog/subtab-3", icon: Clipboard }
];

const profileNavItems: SidebarNavItem[] = [
  { label: "Account Overview", href: "/dashboard/profile/subtab-1", icon: Clipboard },
  { label: "Access & Roles", href: "/dashboard/profile/subtab-2", icon: Clipboard },
  { label: "Activity Logs", href: "/dashboard/profile/subtab-3", icon: Clipboard }
];

const settingsNavItems: SidebarNavItem[] = [
  { label: "Appearance", href: "/dashboard/settings/subtab-1", icon: Clipboard },
  { label: "Notifications", href: "/dashboard/settings/subtab-2", icon: Clipboard },
  { label: "Preferences", href: "/dashboard/settings/subtab-3", icon: Clipboard }
];

const mainTabNavItems: MainTabNavItem[] = [
  {
    id: "HomeDashboard",
    label: "Home Dashboard",
    href: "/dashboard/summary",
    icon: House
  },
  {
    id: "RecordsManagement",
    label: "Records Management",
    href: "/dashboard/records/subtab-1",
    icon: Grid1x2
  },
  {
    id: "CleaningSchedule",
    label: "Cleaning Schedule",
    href: "/dashboard/cleaning/subtab-1",
    icon: CalendarCheck
  },
  {
    id: "ReportsAnalytics",
    label: "Reports Analytics",
    href: "/dashboard/reports/subtab-1",
    icon: BarChart
  },
  {
    id: "FlagsMonitoring",
    label: "Flags Monitoring",
    href: "/dashboard/flags/subtab-1",
    icon: Flag
  },
  {
    id: "ChangelogHistory",
    label: "System Changelog",
    href: "/dashboard/changelog/subtab-1",
    icon: ClockHistory
  },
  {
    id: "AdminProfile",
    label: "Admin Profile",
    href: "/dashboard/profile/subtab-1",
    icon: PersonCircle
  },
  {
    id: "DashboardSettings",
    label: "Dashboard Settings",
    href: "/dashboard/settings/subtab-1",
    icon: Gear
  }
];

export default function Sidebar({
  isMobileOpen,
  onClose,
  activeMainTab,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const SIDEBAR_WIDTH = 260;
  const OUTER_SIDEBAR_PADDING = 12; // matches `p-3`
  const NAV_HORIZONTAL_PADDING = 12; // matches `px-3`
  const NAV_LIST_PADDING = 8; // matches `p-2`
  const SIDEBAR_ANIMATION_MS = 280;
  const SIDEBAR_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
  const INNER_SIDEBAR_WIDTH = SIDEBAR_WIDTH - OUTER_SIDEBAR_PADDING * 2;
  const activeBarLeftOffset = -NAV_HORIZONTAL_PADDING;
  const navItemsByMainTab: Record<string, SidebarNavItem[]> = {
    HomeDashboard: homeNavItems,
    RecordsManagement: recordsNavItems,
    CleaningSchedule: cleaningNavItems,
    ReportsAnalytics: reportsNavItems,
    FlagsMonitoring: flagsNavItems,
    ChangelogHistory: changelogNavItems,
    AdminProfile: profileNavItems,
    DashboardSettings: settingsNavItems
  };
  const navItems = navItemsByMainTab[activeMainTab] ?? homeNavItems;
  const activePath = optimisticHref ?? pathname;
  const activeIndex = navItems.findIndex((item) => item.href === activePath);
  const activeBarWidth = INNER_SIDEBAR_WIDTH;
  const titleMap: Record<string, { label: string; title?: string }> = {
    HomeDashboard: { label: "Home", title: "Dashboard" },
    RecordsManagement: { label: "Records", title: "Management" },
    CleaningSchedule: { label: "Cleaning", title: "Schedule" },
    ReportsAnalytics: { label: "Reports", title: "Analytics" },
    FlagsMonitoring: { label: "Flags", title: "Monitoring" },
    ChangelogHistory: { label: "System", title: "Changelog" },
    AdminProfile: { label: "Admin", title: "Profile" },
    DashboardSettings: { label: "Dashboard", title: "Settings" }
  };
  const activeTitle = titleMap[activeMainTab] ?? titleMap.HomeDashboard;
  const mainTabSections = mainTabNavItems.map((tab) => ({
    ...tab,
    subItems: navItemsByMainTab[tab.id] ?? []
  }));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const panel = panelRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;

    if (panel) {
      panel.focus();
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && panel) {
        const focusable = panel.querySelectorAll<HTMLElement>(
          "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isMobileOpen, onClose]);

  useEffect(() => {
    if (optimisticHref === pathname) {
      setOptimisticHref(null);
    }
  }, [optimisticHref, pathname]);

  useEffect(() => {
    mainTabNavItems.forEach((item) => {
      router.prefetch(item.href);
    });

    navItems.forEach((item) => {
      if (item.href) {
        router.prefetch(item.href);
      }
    });
  }, [navItems, router]);

  const handleMobileNavigate = (href: string) => {
    setOptimisticHref(href);
    router.push(href);
    onClose();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="hidden items-center justify-between px-4 pt-6 md:flex">
        <div className="leading-tight">
          <div className="text-xs uppercase tracking-[0.3em] text-text-muted">
            {activeTitle.label}
          </div>
          {activeTitle.title ? (
            <div className="text-lg font-semibold">{activeTitle.title}</div>
          ) : null}
        </div>
        <div className="hidden md:block">
          <button
            type="button"
            className="rounded-full p-2 text-text-muted"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapse}
          >
            <LayoutSidebar size={18} />
          </button>
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 md:mt-6 md:px-3">
        <div className="space-y-4 pb-2 md:hidden">
          {mainTabSections.map((section) => {
            const Icon = section.icon;
            const isActiveSection = activeMainTab === section.id;

            return (
              <section
                key={section.id}
                className={`rounded-2xl border ${
                  isActiveSection ? "border-topbar/40" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleMobileNavigate(section.href)}
                  className={`flex w-full items-center gap-2 rounded-t-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                    isActiveSection
                      ? "bg-topbar text-text-on-dark"
                      : "text-text-on-light hover:bg-shell"
                  }`}
                  aria-current={isActiveSection ? "page" : undefined}
                >
                  <Icon size={16} />
                  <span>{section.label}</span>
                </button>

                <div className="space-y-1 px-2 pb-2 pt-2">
                  {section.subItems.map((item) => {
                    const SubIcon = item.icon;
                    const href = item.href;

                    if (!href) {
                      return null;
                    }

                    const isActiveSubItem = activePath === href;
                    return (
                      <button
                        key={`${section.id}-${item.label}`}
                        type="button"
                        onClick={() => handleMobileNavigate(href)}
                        className={`flex h-10 w-full items-center gap-2 rounded-xl px-2 text-left text-sm transition ${
                          isActiveSubItem
                            ? "bg-topbar text-text-on-dark shadow-sm"
                            : "text-text-on-light hover:bg-shell"
                        }`}
                      >
                        <SubIcon size={14} />
                        <span className="truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="ml-auto">
                            <Badge label={item.badge} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="relative hidden p-2 md:block">
          {activeIndex >= 0 ? (
            <span
              className={`pointer-events-none absolute h-11 bg-topbar ${
                hasMounted ? "transition-transform duration-200 ease-out" : ""
              }`}
              style={{
                left: activeBarLeftOffset,
                width: activeBarWidth,
                transform: `translateY(${activeIndex * 48}px)`
              }}
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-[#22D3C5]" />
            </span>
          ) : null}
          <div className="relative z-10 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = item.href ? activePath === item.href : false;
              const Icon = item.icon;
              const content = (
                <>
                  <Icon size={18} className="shrink-0" />
                  <span className="inline">
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="ml-auto flex">
                      <Badge label={item.badge} />
                    </span>
                  ) : null}
                </>
              );

              const className = `group relative z-10 flex h-11 w-[calc(100%+24px)] -ml-6 items-center gap-3 px-3 pl-6 text-sm font-medium ${
                isActive ? "text-text-on-dark" : "text-text-on-light"
              }`;

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch
                  className={className}
                  aria-label={item.label}
                  onClick={() => {
                    if (item.href) {
                      setOptimisticHref(item.href);
                    }

                    if (isMobileOpen) {
                      onClose();
                    }
                  }}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className={`${className} cursor-default opacity-70`}
                  aria-label={item.label}
                  disabled
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="px-4 pb-6">
        <CommandMenu />
        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm text-text-muted hover:bg-shell"
            aria-label="View manual"
          >
            <QuestionCircle size={16} />
            <span className="inline">
              View Manual
            </span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm text-text-muted hover:bg-shell"
            aria-label="Contact admin"
          >
            <Telephone size={16} />
            <span className="inline">
              Contact Admin
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className="sticky top-0 hidden h-dvh self-start overflow-hidden overscroll-none bg-shell text-text-on-light md:flex md:h-screen flex-none shrink-0 motion-reduce:transition-none"
        style={{
          width: isCollapsed ? 0 : SIDEBAR_WIDTH,
          transition: `width ${SIDEBAR_ANIMATION_MS}ms ${SIDEBAR_EASING}`
        }}
        aria-hidden={isCollapsed}
      >
        <div className="h-full w-full overflow-hidden p-3">
          <div
            className={`h-full shrink-0 overflow-hidden rounded-3xl bg-sidebar shadow-[0_12px_36px_rgba(0,0,0,0.08)] motion-reduce:transition-none ${
              isCollapsed ? "pointer-events-none" : "pointer-events-auto"
            }`}
            style={{
              width: INNER_SIDEBAR_WIDTH,
              opacity: isCollapsed ? 0 : 1,
              transition: `opacity ${SIDEBAR_ANIMATION_MS}ms ${SIDEBAR_EASING}`,
              willChange: "opacity"
            }}
          >
            {sidebarContent}
          </div>
        </div>
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar overlay"
            onClick={onClose}
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="relative h-full w-[min(22rem,88vw)] overflow-y-auto overflow-x-hidden rounded-r-3xl bg-sidebar text-text-on-light shadow-xl"
          >
            <div className="flex items-center justify-between px-4 pt-4 md:hidden">
              <div className="text-sm uppercase tracking-[0.3em] text-text-muted">
                Navigation
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      ) : null}
    </>
  );
}
