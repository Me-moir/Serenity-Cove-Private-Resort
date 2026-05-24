"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    label: "Records Subtab 1",
    href: "/dashboard/records/subtab-1",
    group: "Records",
    description: "Records management overview.",
    keywords: ["records", "logs", "documents"]
  },
  {
    label: "Records Subtab 2",
    href: "/dashboard/records/subtab-2",
    group: "Records",
    description: "Records detail view.",
    keywords: ["records", "detail", "subtab 2"]
  },
  {
    label: "Records Subtab 3",
    href: "/dashboard/records/subtab-3",
    group: "Records",
    description: "Records alternate view.",
    keywords: ["records", "subtab 3", "history"]
  },
  {
    label: "Cleaning Subtab 1",
    href: "/dashboard/cleaning/subtab-1",
    group: "Cleaning",
    description: "Cleaning schedule overview.",
    keywords: ["cleaning", "schedule", "shift"]
  },
  {
    label: "Cleaning Subtab 2",
    href: "/dashboard/cleaning/subtab-2",
    group: "Cleaning",
    description: "Cleaning plan details.",
    keywords: ["cleaning", "checklist", "subtab 2"]
  },
  {
    label: "Cleaning Subtab 3",
    href: "/dashboard/cleaning/subtab-3",
    group: "Cleaning",
    description: "Cleaning status and follow-ups.",
    keywords: ["cleaning", "status", "subtab 3"]
  },
  {
    label: "Reports Subtab 1",
    href: "/dashboard/reports/subtab-1",
    group: "Reports",
    description: "Reports and analytics overview.",
    keywords: ["reports", "analytics", "insights"]
  },
  {
    label: "Reports Subtab 2",
    href: "/dashboard/reports/subtab-2",
    group: "Reports",
    description: "Additional reports details.",
    keywords: ["reports", "subtab 2", "analysis"]
  },
  {
    label: "Reports Subtab 3",
    href: "/dashboard/reports/subtab-3",
    group: "Reports",
    description: "Extended reports view.",
    keywords: ["reports", "subtab 3", "dashboard"]
  },
  {
    label: "System Flags",
    href: "/dashboard/flags/subtab-1",
    group: "Flags",
    description: "Flagged incidents and alerts.",
    keywords: ["flags", "alerts", "incidents"]
  },
  {
    label: "Crash & Downtime",
    href: "/dashboard/flags/subtab-2",
    group: "Flags",
    description: "Downtime and crash monitoring.",
    keywords: ["downtime", "crash", "issues"]
  },
  {
    label: "Traffic Monitor",
    href: "/dashboard/flags/subtab-3",
    group: "Flags",
    description: "Traffic and system load monitoring.",
    keywords: ["traffic", "monitoring", "performance"]
  },
  {
    label: "Recent Updates",
    href: "/dashboard/changelog/subtab-1",
    group: "Changelog",
    description: "Latest updates and improvements.",
    keywords: ["changelog", "updates", "release notes"]
  },
  {
    label: "Patches",
    href: "/dashboard/changelog/subtab-2",
    group: "Changelog",
    description: "Patch list and bug fixes.",
    keywords: ["patches", "fixes", "changelog"]
  },
  {
    label: "Revamps",
    href: "/dashboard/changelog/subtab-3",
    group: "Changelog",
    description: "Major redesigns and feature revamps.",
    keywords: ["revamp", "redesign", "changes"]
  },
  {
    label: "Account Overview",
    href: "/dashboard/profile/subtab-1",
    group: "Profile",
    description: "Admin account information.",
    keywords: ["profile", "account", "admin"]
  },
  {
    label: "Access & Roles",
    href: "/dashboard/profile/subtab-2",
    group: "Profile",
    description: "Permission and role settings.",
    keywords: ["roles", "permissions", "access"]
  },
  {
    label: "Activity Logs",
    href: "/dashboard/profile/subtab-3",
    group: "Profile",
    description: "Recent account activity logs.",
    keywords: ["activity", "logs", "security"]
  },
  {
    label: "Appearance",
    href: "/dashboard/settings/subtab-1",
    group: "Settings",
    description: "Theme and appearance preferences.",
    keywords: ["settings", "theme", "appearance"]
  },
  {
    label: "Notifications",
    href: "/dashboard/settings/subtab-2",
    group: "Settings",
    description: "Notification preferences.",
    keywords: ["settings", "notifications", "alerts"]
  },
  {
    label: "Preferences",
    href: "/dashboard/settings/subtab-3",
    group: "Settings",
    description: "General application preferences.",
    keywords: ["settings", "preferences", "options"]
  }
];

const RECOMMENDED_HREFS = [
  "/dashboard/summary",
  "/dashboard/calendar",
  "/dashboard/reports/subtab-1",
  "/dashboard/flags/subtab-1",
  "/dashboard/settings/subtab-1"
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
        className="flex w-full items-center justify-between rounded-full bg-topbar px-4 py-2 text-xs text-text-on-dark"
        aria-label="Open command menu"
      >
        <span className="flex items-center gap-2">
          <Search size={14} />
          <span className="text-text-on-dark/70">Find</span>
        </span>
        <kbd className="hidden rounded-full border border-white/30 px-2 py-0.5 text-[10px] tracking-[0.2em] sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-20 sm:p-8 sm:pt-24">
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
        </div>
      ) : null}
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
