import { Dot, Fire } from "react-bootstrap-icons";
import type { ReportItem } from "@/types";

const reports: ReportItem[] = [
  {
    category: "Weather",
    title: "Partly Sunny, Excessive Heat Reported",
    detail: "Stay hydrated and monitor outdoor areas.",
    accent: "orange",
    icon: <Fire size={16} />
  },
  {
    category: "AI Insight",
    title: "Operational Signals",
    detail: "Peak arrival window expected from 3PM to 5PM.",
    accent: "blue"
  },
  {
    category: "Guests",
    title: "49 Reservations Expected",
    detail: "Higher than usual ↗",
    accent: "orange"
  },
  {
    category: "Guests",
    title: "2 VIP Guests Confirmed",
    detail: "High profile guests expected to arrive at 4PM",
    accent: "blue"
  },
  {
    category: "Staff Task",
    title: "13 Pending Maintenance",
    detail: "View Staff Task Checklist",
    accent: "orange"
  },
  {
    category: "Reservations",
    title: "98 New Pending Reservations",
    detail: "Higher than usual ↗",
    accent: "orange"
  }
];

export default function ReportsPanel() {
  const accentMap: Record<string, string> = {
    orange: "text-accent-orange",
    blue: "text-accent-blue",
    red: "text-accent-red",
    green: "text-accent-green"
  };

  return (
    <div className="rounded-3xl bg-card-dark p-4 text-text-on-dark sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold tracking-[0.2em] sm:text-lg sm:tracking-[0.3em]">
          REPORTS
        </div>
        <div className="text-[11px] text-text-on-dark/70 sm:text-xs">MAY 26, 2026</div>
      </div>

      <div className="mt-4 space-y-4">
        {reports.map((report, index) => (
          <div
            key={`${report.category}-${index}`}
            className="rounded-2xl bg-white/5 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-on-dark/70 sm:text-xs sm:tracking-[0.3em]">
              {report.icon ? (
                <span className={report.accent ? accentMap[report.accent] : ""}>
                  {report.icon}
                </span>
              ) : null}
              <span className={report.accent ? accentMap[report.accent] : ""}>
                {report.category}
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold sm:text-base">{report.title}</div>

            {report.category === "AI Insight" ? (
              <ul className="mt-3 space-y-2 text-xs text-text-on-dark/70 sm:text-sm">
                <li className="flex items-center gap-2">
                  <Dot size={18} />
                  Focus staffing between 3PM and 5PM.
                </li>
                <li className="flex items-center gap-2">
                  <Dot size={18} />
                  VIP arrivals likely to request lounge seating.
                </li>
                <li className="flex items-center gap-2">
                  <Dot size={18} />
                  Maintenance queue should be cleared before 2PM.
                </li>
              </ul>
            ) : report.detail ? (
              report.category === "Staff Task" ? (
                <a
                  href="/dashboard/staff-task"
                  className="mt-2 inline-flex text-xs text-accent-orange sm:text-sm"
                >
                  {report.detail}
                </a>
              ) : (
                <div
                  className={`mt-2 text-xs sm:text-sm ${
                    report.accent === "orange"
                      ? "text-accent-orange"
                      : "text-text-on-dark/70"
                  }`}
                >
                  {report.detail}
                </div>
              )
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
