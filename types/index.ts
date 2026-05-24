import type { ReactNode } from "react";

export type AccentColor = "orange" | "red" | "green" | "blue";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

export interface DailyReportItem {
  category: string;
  title: string;
  detail?: string;
  accent?: AccentColor;
  icon?: "fire";
  badge?: string;
  bullets?: string[];
  linkLabel?: string;
  linkHref?: string;
}

export interface DailyReportScenario {
  id: string;
  label: string;
  reports: DailyReportItem[];
}

export interface DailyReportOverride extends DailyReportScenario {
  date: string;
}

export interface DailyReportSnapshotsData {
  defaultScenarios: DailyReportScenario[];
  dateOverrides: DailyReportOverride[];
}

export interface CalendarDay {
  day: number | null;
  dateKey?: string;
  dots?: AccentColor[];
  isToday?: boolean;
}
