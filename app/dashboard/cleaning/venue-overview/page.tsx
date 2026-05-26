"use client";

import { useState } from "react";
import { useStaffAssignments } from "@/components/providers/StaffAssignmentProvider";
import { STAFF } from "@/lib/data/staff";
import {
  FLOORS,
  AREAS,
  INIT_CHECKED_OUT,
  INIT_PREP_CHECKS,
  INIT_DAMAGE_NOTES,
  LS_KEYS,
  safeLS,
  type ChecklistFloor,
  type CheckedState,
  type PrepCheckState,
  type NoteState,
} from "@/lib/data/cleaningChecklist";

type OverviewStatus = "Occupied" | "Vacated" | "In Prep" | "Ready";

function getOverviewStatus(
  prepChecks: Record<string, boolean>,
  isCheckedOut: boolean
): OverviewStatus {
  if (!isCheckedOut) return "Occupied";
  const vals = Object.values(prepChecks ?? {});
  if (vals.length > 0 && vals.every(Boolean)) return "Ready";
  if (vals.some(Boolean)) return "In Prep";
  return "Vacated";
}

const STATUS_CFG: Record<OverviewStatus, { dot: string; badge: string; label: string }> = {
  Occupied: {
    dot: "bg-white/20",
    badge: "bg-white/[0.06] border-white/[0.08] text-white/35",
    label: "Occupied",
  },
  Vacated: {
    dot: "bg-accent-blue shadow-[0_0_5px_var(--color-accent-blue)]",
    badge: "bg-accent-blue/10 border-accent-blue/20 text-accent-blue",
    label: "Vacated",
  },
  "In Prep": {
    dot: "bg-accent-orange shadow-[0_0_5px_var(--color-accent-orange)]",
    badge: "bg-accent-orange/10 border-accent-orange/20 text-accent-orange",
    label: "In Prep",
  },
  Ready: {
    dot: "bg-accent-green shadow-[0_0_5px_var(--color-accent-green)]",
    badge: "bg-accent-green/10 border-accent-green/20 text-accent-green",
    label: "Ready",
  },
};

export default function CleaningSubtab1Page() {
  const { dbStaff } = useStaffAssignments();

  const [checkedOut] = useState<CheckedState>(() =>
    typeof window === "undefined" ? INIT_CHECKED_OUT : safeLS(LS_KEYS.checkout, INIT_CHECKED_OUT)
  );
  const [prepChecks] = useState<PrepCheckState>(() =>
    typeof window === "undefined" ? INIT_PREP_CHECKS : safeLS(LS_KEYS.prepChecks, INIT_PREP_CHECKS)
  );
  const [damageNotes] = useState<NoteState>(() =>
    typeof window === "undefined" ? INIT_DAMAGE_NOTES : safeLS(LS_KEYS.damage, INIT_DAMAGE_NOTES)
  );

  const statuses = AREAS.map((a) => getOverviewStatus(prepChecks[a.id], checkedOut[a.id]));
  const occupiedCount = statuses.filter((s) => s === "Occupied").length;
  const vacatedCount  = statuses.filter((s) => s === "Vacated").length;
  const inPrepCount   = statuses.filter((s) => s === "In Prep").length;
  const readyCount    = statuses.filter((s) => s === "Ready").length;

  const activeCount = vacatedCount + inPrepCount + readyCount; // rooms being worked on

  const staffList = dbStaff.length > 0
    ? dbStaff.map((s) => ({ name: s.staff_name, role: s.role, status: "On Duty" }))
    : STAFF.map((s) => ({ name: s.name, role: s.role, status: s.status }));

  const flaggedNotes = AREAS
    .filter((a) => damageNotes[a.id]?.trim())
    .map((a) => ({ label: a.label, note: damageNotes[a.id].trim() }));

  return (
    <div className="space-y-5">

      {/* ── STAT CHIPS ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "All Rooms",  value: AREAS.length, color: "text-white/60",  sub: "total venue areas" },
          { label: "Occupied",   value: occupiedCount, color: "text-white/50", sub: "guests still in" },
          { label: "In Prep",    value: vacatedCount + inPrepCount, color: "text-accent-orange", sub: `${vacatedCount} pending · ${inPrepCount} active` },
          { label: "Ready",      value: readyCount,    color: "text-accent-green", sub: "prepared for guests" },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] px-5 py-4 text-white"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-extrabold tabular-nums ${card.color}`}>
              {card.value}
            </p>
            <p className="mt-1 text-[10px] text-white/25">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* ── LEFT — VENUE STATUS MAP ── */}
        <div className="col-span-7">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-6 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />

            {/* legend */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Venue Status Map
              </h2>
              <div className="flex items-center gap-4">
                {(["Occupied", "Vacated", "In Prep", "Ready"] as OverviewStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_CFG[s].dot}`} />
                    <span className="text-[9px] font-medium text-white/30">{STATUS_CFG[s].label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* floor sections */}
            <div className="space-y-5">
              {(FLOORS as ChecklistFloor[]).map((floor) => (
                <div key={floor.id}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
                      {floor.label}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {floor.areas.map((area) => {
                      const status = getOverviewStatus(prepChecks[area.id], checkedOut[area.id]);
                      const cfg = STATUS_CFG[status];
                      const done = Object.values(prepChecks[area.id] ?? {}).filter(Boolean).length;
                      const total = area.tasks.length;
                      return (
                        <div
                          key={area.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <span className="text-[11px] text-white/60 truncate">{area.label}</span>
                          </div>
                          {checkedOut[area.id] && (
                            <span className="font-mono text-[9px] text-white/25 flex-shrink-0">
                              {done}/{total}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="col-span-5 space-y-4">

          {/* STAFF ON SHIFT */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-5 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-4">
              Staff on Shift
            </h2>
            <div className="space-y-2">
              {staffList.map((s, i) => {
                const statusDot =
                  s.status === "On Duty"    ? "bg-accent-green" :
                  s.status === "On Standby" ? "bg-accent-orange" :
                  "bg-white/20";
                const avatarColors = [
                  "bg-accent-blue/20 text-accent-blue",
                  "bg-accent-green/20 text-accent-green",
                  "bg-accent-orange/15 text-accent-orange",
                ];
                return (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                  >
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        avatarColors[i % avatarColors.length]
                      }`}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white/80 truncate">{s.name}</p>
                      <p className="text-[10px] text-white/35 truncate">{s.role}</p>
                    </div>
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* FLAGGED NOTES */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-5 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Flagged Notes
              </h2>
              {flaggedNotes.length > 0 && (
                <span className="rounded-full bg-accent-red/15 px-2 py-0.5 text-[9px] font-bold text-accent-red">
                  {flaggedNotes.length}
                </span>
              )}
            </div>

            {flaggedNotes.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                  <span className="text-base">✓</span>
                </div>
                <p className="text-xs text-white/30">No issues flagged</p>
              </div>
            ) : (
              <div className="space-y-2">
                {flaggedNotes.map(({ label, note }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-accent-red/15 bg-accent-red/[0.05] px-3 py-2.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-red/70 mb-1">
                      {label}
                    </p>
                    <p className="text-xs leading-relaxed text-white/50">{note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OVERALL PROGRESS */}
          {activeCount > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] px-5 py-4 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                  Prep Progress
                </h2>
                <span className="font-mono text-[10px] text-white/25">
                  {readyCount}/{activeCount} rooms ready
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-accent-green transition-all duration-500"
                  style={{ width: `${Math.round((readyCount / activeCount) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-white/25">
                {Math.round((readyCount / activeCount) * 100)}% of active rooms fully prepared
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
