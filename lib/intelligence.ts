import { parseDateKey } from "@/lib/date";
import snapshotsData from "@/lib/data/dailyReportSnapshots.json";
import type { AccentColor, DailyReportScenario, DailyReportSnapshotsData } from "@/types";

const typedSnapshots = snapshotsData as DailyReportSnapshotsData;

const dotPriority: AccentColor[] = ["orange", "green", "blue", "red"];

export function getIntelligenceSnapshotForDate(dateKey: string): DailyReportScenario {
  const override = typedSnapshots.dateOverrides.find((snapshot) => snapshot.date === dateKey);
  if (override) {
    return override;
  }

  const scenarios = typedSnapshots.defaultScenarios;
  if (scenarios.length === 0) {
    return {
      id: "no-data",
      label: "No Snapshot Data",
      reports: []
    };
  }

  const day = parseDateKey(dateKey).getDate();
  const scenarioIndex = (day - 1) % scenarios.length;
  return scenarios[scenarioIndex];
}

export function getIntelligenceDotColorsForDate(dateKey: string) {
  const snapshot = getIntelligenceSnapshotForDate(dateKey);
  const presentColors = new Set<AccentColor>();

  snapshot.reports.forEach((report) => {
    if (report.accent) {
      presentColors.add(report.accent);
    }
  });

  return dotPriority.filter((color) => presentColors.has(color));
}
