"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ClockHistory, Search, Star, X } from "react-bootstrap-icons";

interface SearchItem {
  label: string;
  href: string;
  group: string;
  description: string;
  keywords: string[];
}

interface UsageEntry {
  count: number;
  lastUsedAt: number;
}

type SearchUsageMap = Record<string, UsageEntry>;

const USAGE_STORAGE_KEY = "home-dashboard-search-usage-v1";
const MAX_VISIBLE_RESULTS = 8;

const SEARCH_ITEMS: SearchItem[] = [
  {
    label: "Summary",
    href: "/dashboard/summary",
    group: "Home",
    description: "Dashboard overview and quick status.",
    keywords: ["home", "overview", "totals", "metrics"]
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    group: "Home",
    description: "Schedule and event timeline.",
    keywords: ["date", "events", "timeline", "schedule"]
  },
  {
    label: "Reservations",
    href: "/dashboard/reservation",
    group: "Home",
    description: "View and manage reservations.",
    keywords: ["booking", "guests", "pending"]
  },
  {
    label: "Guests",
    href: "/dashboard/guests",
    group: "Home",
    description: "Guest directory and guest stats.",
    keywords: ["visitors", "guest list", "arrivals"]
  },
  {
    label: "Staff Task",
    href: "/dashboard/staff-task",
    group: "Home",
    description: "Task list and assignment tracking.",
    keywords: ["tasks", "checklist", "maintenance"]
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    group: "Home",
    description: "Customer reviews and ratings.",
    keywords: ["feedback", "rating", "comments"]
  },
  {
    label: "Guest Records",
    href: "/dashboard/records/guest-records",
    group: "Records",
    description: "Guest profiles and booking history.",
    keywords: ["guests", "profiles", "records"]
  },
  {
    label: "Financial Records",
    href: "/dashboard/records/financial-records",
    group: "Records",
    description: "Financial transactions and billing.",
    keywords: ["financial", "billing", "payments"]
  },
  {
    label: "Incidents",
    href: "/dashboard/records/incidents",
    group: "Records",
    description: "Incident reports and history.",
    keywords: ["incidents", "reports", "issues"]
  },
  {
    label: "Venue Overview",
    href: "/dashboard/cleaning/venue-overview",
    group: "Maintenance",
    description: "Live status board for all rooms, staff on shift, and flagged notes.",
    keywords: ["venue", "overview", "status", "board", "rooms"]
  },
  {
    label: "Room Inspection",
    href: "/dashboard/cleaning/room-inspection",
    group: "Maintenance",
    description: "Post check-out inspection and damage notes.",
    keywords: ["inspection", "checkout", "damage", "rooms"]
  },
  {
    label: "Venue Preparation",
    href: "/dashboard/cleaning/venue-preparation",
    group: "Maintenance",
    description: "Area-by-area prep checklist for incoming check-ins.",
    keywords: ["venue", "preparation", "checklist", "cleaning", "prep"]
  },
  {
    label: "Occupancy Reports",
    href: "/dashboard/reports/occupancy-reports",
    group: "Reports",
    description: "Occupancy rates and booking summaries.",
    keywords: ["occupancy", "bookings", "availability"]
  },
  {
    label: "Revenue Reports",
    href: "/dashboard/reports/revenue-reports",
    group: "Reports",
    description: "Revenue breakdown and financial reports.",
    keywords: ["revenue", "income", "financial", "reports"]
  },
  {
    label: "Guest Analytics",
    href: "/dashboard/reports/guest-analytics",
    group: "Reports",
    description: "Guest trends and behaviour analytics.",
    keywords: ["analytics", "guests", "trends"]
  },
  {
    label: "System Flags",
    href: "/dashboard/flags/system-flags",
    group: "Flags",
    description: "Flagged incidents and alerts.",
    keywords: ["flags", "alerts", "incidents"]
  },
  {
    label: "Crash & Downtime",
    href: "/dashboard/flags/crash-downtime",
    group: "Flags",
    description: "Downtime and crash monitoring.",
    keywords: ["downtime", "crash", "issues"]
  },
  {
    label: "Traffic Monitor",
    href: "/dashboard/flags/traffic-monitor",
    group: "Flags",
    description: "Traffic and system load monitoring.",
    keywords: ["traffic", "monitoring", "performance"]
  },
  {
    label: "Recent Updates",
    href: "/dashboard/changelog/recent-updates",
    group: "Changelog",
    description: "Latest updates and improvements.",
    keywords: ["changelog", "updates", "release notes"]
  },
  {
    label: "Patches",
    href: "/dashboard/changelog/patches",
    group: "Changelog",
    description: "Patch list and bug fixes.",
    keywords: ["patches", "fixes", "changelog"]
  },
  {
    label: "Revamps",
    href: "/dashboard/changelog/revamps",
    group: "Changelog",
    description: "Major redesigns and feature revamps.",
    keywords: ["revamp", "redesign", "changes"]
  },
  {
    label: "Account Overview",
    href: "/dashboard/profile/personal-information",
    group: "Profile",
    description: "Admin account information.",
    keywords: ["profile", "account", "admin"]
  },
  {
    label: "Access & Roles",
    href: "/dashboard/profile/password-security",
    group: "Profile",
    description: "Permission and role settings.",
    keywords: ["roles", "permissions", "access"]
  },
  {
    label: "Activity Logs",
    href: "/dashboard/profile/activity-logs",
    group: "Profile",
    description: "Recent account activity logs.",
    keywords: ["activity", "logs", "security"]
  },
  {
    label: "Appearance",
    href: "/dashboard/settings/general-settings",
    group: "Settings",
    description: "Theme and appearance preferences.",
    keywords: ["settings", "theme", "appearance"]
  },
  {
    label: "Notifications",
    href: "/dashboard/settings/system-integrations",
    group: "Settings",
    description: "Notification preferences.",
    keywords: ["settings", "notifications", "alerts"]
  },
  {
    label: "Preferences",
    href: "/dashboard/settings/preferences",
    group: "Settings",
    description: "General application preferences.",
    keywords: ["settings", "preferences", "options"]
  }
];

const RECOMMENDED_HREFS = [
  "/dashboard/summary",
  "/dashboard/calendar",
  "/dashboard/reports/occupancy-reports",
  "/dashboard/flags/system-flags",
  "/dashboard/settings/general-settings"
];

const itemByHref = Object.fromEntries(SEARCH_ITEMS.map((item) => [item.href, item]));

function parseUsageMap(value: string | null): SearchUsageMap {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as SearchUsageMap;
    const sanitized: SearchUsageMap = {};

    Object.entries(parsed).forEach(([href, entry]) => {
      if (!itemByHref[href]) {
        return;
      }

      if (!entry || typeof entry.count !== "number" || typeof entry.lastUsedAt !== "number") {
        return;
      }

      sanitized[href] = {
        count: Math.max(0, Math.floor(entry.count)),
        lastUsedAt: Math.max(0, Math.floor(entry.lastUsedAt))
      };
    });

    return sanitized;
  } catch {
    return {};
  }
}

export default function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [usageMap, setUsageMap] = useState<SearchUsageMap>({});

  useEffect(() => {
    try {
      const storedUsage = parseUsageMap(localStorage.getItem(USAGE_STORAGE_KEY));
      setUsageMap(storedUsage);
    } catch {
      setUsageMap({});
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusId = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => {
      window.clearTimeout(focusId);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleGlobalShortcut);
    return () => {
      document.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const triggerButton = buttonRef.current;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
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
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      triggerButton?.focus();
    };
  }, [isOpen]);

  const recommendedItems = useMemo(
    () =>
      RECOMMENDED_HREFS.map((href) => itemByHref[href]).filter(
        (item): item is SearchItem => Boolean(item)
      ),
    []
  );

  const frequentItems = useMemo(() => {
    return Object.entries(usageMap)
      .sort((a, b) => {
        if (b[1].count !== a[1].count) {
          return b[1].count - a[1].count;
        }

        return b[1].lastUsedAt - a[1].lastUsedAt;
      })
      .map(([href]) => itemByHref[href])
      .filter((item): item is SearchItem => Boolean(item))
      .slice(0, 5);
  }, [usageMap]);

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return SEARCH_ITEMS.filter((item) => {
      const searchableText = [
        item.label,
        item.group,
        item.description,
        ...item.keywords
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    }).slice(0, MAX_VISIBLE_RESULTS);
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const primaryList = hasQuery ? searchResults : recommendedItems;
  const noResultState = hasQuery && primaryList.length === 0;

  const trackSearchUsage = (href: string) => {
    const now = Date.now();
    const nextUsageMap: SearchUsageMap = {
      ...usageMap,
      [href]: {
        count: (usageMap[href]?.count ?? 0) + 1,
        lastUsedAt: now
      }
    };

    setUsageMap(nextUsageMap);
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(nextUsageMap));
    } catch {
      // Ignore write errors from unavailable/private storage contexts.
    }
  };

  const goTo = (item: SearchItem) => {
    trackSearchUsage(item.href);
    setQuery("");
    setIsOpen(false);

    if (item.href !== pathname) {
      router.push(item.href);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && primaryList[0]) {
      event.preventDefault();
      goTo(primaryList[0]);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative flex w-full animate-rainbow cursor-pointer items-center justify-between rounded-full border-0 bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] bg-[length:200%] px-4 py-2 text-xs text-text-on-light transition-transform duration-200 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:bg-[length:200%] before:[filter:blur(0.8rem)] hover:scale-105 active:scale-95 dark:bg-[linear-gradient(#191919,#191919),linear-gradient(#191919_50%,rgba(25,25,25,0.6)_80%,rgba(25,25,25,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] dark:text-text-on-dark dark:ring-1 dark:ring-white/15"
        aria-label="Open command menu"
      >
        <span className="flex items-center gap-2">
          <Search size={14} />
          <span className="text-text-muted">Find</span>
        </span>
        <kbd className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] tracking-[0.2em] sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-20 sm:p-8 sm:pt-24">
              <button
                type="button"
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                aria-label="Close search modal"
                onClick={() => setIsOpen(false)}
              />
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="Search Dashboard"
                className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-sidebar text-text-on-light shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
                  <Search size={16} className="text-text-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Search pages, subtabs, and settings..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
                    aria-label="Search dashboard routes"
                  />
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-text-muted hover:bg-surface-soft"
                    aria-label="Close search"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-5">
                  <SearchSection
                    title={hasQuery ? "Search Results" : "Recommendations"}
                    icon={hasQuery ? <Search size={14} /> : <Star size={14} />}
                    emptyMessage={hasQuery ? "No result found for your search." : undefined}
                    items={primaryList}
                    onSelect={goTo}
                  />

                  <SearchSection
                    title="Frequently Searched"
                    icon={<ClockHistory size={14} />}
                    emptyMessage="Your frequently searched pages will appear here."
                    items={frequentItems}
                    onSelect={goTo}
                  />

                  {noResultState ? (
                    <SearchSection
                      title="Try These Instead"
                      icon={<Star size={14} />}
                      items={recommendedItems}
                      onSelect={goTo}
                    />
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

interface SearchSectionProps {
  title: string;
  icon: React.ReactNode;
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
  emptyMessage?: string;
}

function SearchSection({
  title,
  icon,
  items,
  onSelect,
  emptyMessage
}: SearchSectionProps) {
  return (
    <section className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-muted">
        <span>{icon}</span>
        <span>{title}</span>
      </div>

      {items.length === 0 ? (
        emptyMessage ? (
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-text-muted">
            {emptyMessage}
          </div>
        ) : null
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-start justify-between rounded-2xl border border-white/10 px-4 py-3 text-left transition hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              <div>
                <div className="text-sm font-semibold text-text-on-light">{item.label}</div>
                <div className="mt-1 text-xs text-text-muted">{item.description}</div>
              </div>
              <div className="ml-3 mt-1 flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-muted">
                <span>{item.group}</span>
                <ArrowUpRight size={12} />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
