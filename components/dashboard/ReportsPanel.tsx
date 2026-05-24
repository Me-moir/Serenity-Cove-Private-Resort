import { Dot, Fire } from "react-bootstrap-icons";
import { getIntelligenceSnapshotForDate } from "@/lib/intelligence";
import type { AccentColor } from "@/types";

interface IntelligenecePanelProps {
  selectedDate: string;
}

const accentMap: Record<AccentColor, string> = {
  orange: "text-accent-orange",
  blue: "text-accent-blue",
  red: "text-accent-red",
  green: "text-accent-green"
};

const chipMap: Record<AccentColor, string> = {
  orange: "bg-accent-orange/15 text-accent-orange",
  blue: "bg-accent-blue/15 text-accent-blue",
  red: "bg-accent-red/15 text-accent-red",
  green: "bg-accent-green/15 text-accent-green"
};

export default function IntelligenecePanel({ selectedDate }: IntelligenecePanelProps) {
  const snapshot = getIntelligenceSnapshotForDate(selectedDate);

  return (
    <div className="rounded-3xl border border-white/10 bg-card-dark p-4 text-text-on-dark shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-6">
      <div>
        <div className="text-lg font-semibold sm:text-xl">Intelligence</div>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-accent-blue sm:text-[11px]">
        {snapshot.label}
      </div>

      <div className="mt-5 space-y-3">
        {snapshot.reports.map((report, index) => (
          <div
            key={`${report.category}-${index}`}
            className="rounded-2xl border border-white/5 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-white/20 sm:p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase text-text-on-dark/60 sm:text-[11px]">
                {report.icon === "fire" ? (
                  <span className={report.accent ? accentMap[report.accent] : ""}>
                    <Fire size={15} />
                  </span>
                ) : null}
                <span className={report.accent ? accentMap[report.accent] : ""}>
                  {report.category}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[9px] uppercase ${
                  report.accent ? chipMap[report.accent] : "bg-white/10 text-text-on-dark/70"
                }`}
              >
                {report.badge ?? "Live"}
              </span>
            </div>
            <div className="mt-3 text-sm font-semibold sm:text-base">{report.title}</div>

            {report.bullets?.length ? (
              <ul className="mt-3 space-y-2 text-xs text-text-on-dark/70 sm:text-sm">
                {report.bullets.map((bullet, bulletIndex) => (
                  <li key={`${report.category}-${bulletIndex}`} className="flex items-center gap-2">
                    <Dot size={18} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {report.linkHref && report.linkLabel ? (
              <a
                href={report.linkHref}
                className={`mt-2 inline-flex text-xs sm:text-sm ${
                  report.accent ? accentMap[report.accent] : "text-text-on-dark/70"
                }`}
              >
                {report.linkLabel}
              </a>
            ) : report.detail ? (
              <div
                className={`mt-2 text-xs sm:text-sm ${
                  report.accent ? accentMap[report.accent] : "text-text-on-dark/70"
                }`}
              >
                {report.detail}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
