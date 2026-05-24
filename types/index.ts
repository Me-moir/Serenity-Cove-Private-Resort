import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

export interface ReportItem {
  category: string;
  title: string;
  detail?: string;
  accent?: "orange" | "red" | "green" | "blue";
  icon?: ReactNode;
}

export interface CalendarDay {
  day: number | null;
  dots?: Array<"orange" | "red" | "green" | "blue">;
  isToday?: boolean;
}
