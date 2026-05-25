"use client";

import { useState, useEffect } from "react";
import { useStaffAssignments } from "@/components/providers/StaffAssignmentProvider";
import { STAFF } from "@/lib/data/staff";
import {
  FLOORS,
  AREAS,
  INIT_CHECKED_OUT,
  INIT_PREP_CHECKS,
  INIT_PREP_NOTES,
  LS_KEYS,
  PREP_STATUS_CFG,
  getPrepStatus,
  safeLS,
  type ChecklistFloor,
  type CheckedState,
  type NoteState,
  type PrepCheckState,
} from "@/lib/data/cleaningChecklist";

export default function CleaningSubtab3Page() {
  const { dbStaff } = useStaffAssignments();

  const [prepChecks, setPrepChecks] = useState<PrepCheckState>(() =>
    typeof window === "undefined" ? INIT_PREP_CHECKS : safeLS(LS_KEYS.prepChecks, INIT_PREP_CHECKS)
  );
  const [prepNotes, setPrepNotes] = useState<NoteState>(() =>
    typeof window === "undefined" ? INIT_PREP_NOTES : safeLS(LS_KEYS.prepNotes, INIT_PREP_NOTES)
  );
  // Read-only: checkout state is owned by subtab-2; we read it so we know which
  // rooms to display and can reflect their current checkout status.
  const [checkedOut] = useState<CheckedState>(() =>
    typeof window === "undefined" ? INIT_CHECKED_OUT : safeLS(LS_KEYS.checkout, INIT_CHECKED_OUT)
  );

  useEffect(() => {
    localStorage.setItem(LS_KEYS.prepChecks, JSON.stringify(prepChecks));
  }, [prepChecks]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.prepNotes, JSON.stringify(prepNotes));
  }, [prepNotes]);

  const togglePrepTask = (areaId: string, task: string) =>
    setPrepChecks((prev) => ({
      ...prev,
      [areaId]: { ...prev[areaId], [task]: !prev[areaId][task] },
    }));

  // Only show rooms that have been marked vacant (checked out) in subtab-2
  const vacantAreas = AREAS.filter((a) => checkedOut[a.id]);
  const vacantFloors = (FLOORS as ChecklistFloor[])
    .map((floor) => ({
      ...floor,
      areas: floor.areas.filter((a) => checkedOut[a.id]),
    }))
    .filter((floor) => floor.areas.length > 0);

  const vacantTotal = vacantAreas.length;
  const readyCount = vacantAreas.filter(
    (a) => getPrepStatus(prepChecks[a.id]) === "Ready for Check-In"
  ).length;

  const onDutyStaff = STAFF.filter((s) => s.status === "On Duty" || s.status === "On Standby");

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-12 gap-5">

        {/* ── LEFT SIDEBAR ── */}
        <div className="col-span-4 space-y-4">

          {/* ROOM STATUS SUMMARY */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-5 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Room Statuses
              </h2>
              <span className="font-mono text-[10px] text-white/25">
                {vacantTotal === 0 ? "—" : `${readyCount}/${vacantTotal} ready`}
              </span>
            </div>

            <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.08] mb-5 mt-2">
              <div
                className="h-full rounded-full bg-accent-green transition-all duration-500"
                style={{
                  width: vacantTotal === 0
                    ? "0%"
                    : `${Math.round((readyCount / vacantTotal) * 100)}%`,
                }}
              />
            </div>

            {vacantTotal === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">
                No rooms have been checked out yet.
              </p>
            ) : (
              <div className="space-y-4">
                {vacantFloors.map((floor) => (
                  <div key={floor.id}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 mb-2">
                      {floor.label}
                    </p>
                    <div className="space-y-1.5">
                      {floor.areas.map((area) => {
                        const status = getPrepStatus(prepChecks[area.id]);
                        const cfg = PREP_STATUS_CFG[status];
                        return (
                          <div key={area.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                              <span className="text-[11px] text-white/55 truncate">{area.label}</span>
                            </div>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}
                            >
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STAFF ON SHIFT */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-5 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-4">
              Staff on Shift
            </h2>
            <div className="flex flex-wrap gap-2">
              {(dbStaff.length > 0
                ? dbStaff.map((s) => s.staff_name)
                : onDutyStaff.map((s) => s.name)
              ).map((name) => (
                <div
                  key={name}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/[0.09] transition-colors cursor-default"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — AREA PREP CHECKLIST ── */}
        <div className="col-span-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-6 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Venue Preparation
              </h2>
              {vacantTotal > 0 && (
                <span className="font-mono text-[10px] text-white/25">
                  {vacantTotal} room{vacantTotal !== 1 ? "s" : ""} to prepare
                </span>
              )}
            </div>

            {vacantTotal === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                  <span className="text-xl">🛏️</span>
                </div>
                <p className="text-sm font-semibold text-white/50">No rooms to prepare</p>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/25">
                  Mark rooms as Vacant in the Post Check-Out tab to queue them for preparation.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {vacantFloors.map((floor) => (
                  <div key={floor.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
                        {floor.label}
                      </span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="space-y-3">
                      {floor.areas.map((area) => {
                        const areaDone = Object.values(prepChecks[area.id] ?? {}).filter(Boolean).length;
                        const areaTotal = area.tasks.length;
                        const status = getPrepStatus(prepChecks[area.id]);
                        const cfg = PREP_STATUS_CFG[status];

                        return (
                          <div
                            key={area.id}
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                {area.label}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-white/25">
                                  {areaDone}/{areaTotal}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
                                >
                                  {status}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="grid grid-cols-2 gap-x-5 gap-y-2 flex-1">
                                {area.tasks.map((task) => (
                                  <label
                                    key={task}
                                    className="flex items-center gap-2 group cursor-pointer"
                                  >
                                    <span
                                      onClick={() => togglePrepTask(area.id, task)}
                                      className={`flex-shrink-0 h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all duration-150 ${
                                        prepChecks[area.id]?.[task]
                                          ? "bg-accent-orange border-accent-orange"
                                          : "bg-white/[0.04] border-white/[0.15] group-hover:border-white/30"
                                      }`}
                                    >
                                      {prepChecks[area.id]?.[task] && (
                                        <svg
                                          className="h-2.5 w-2.5 text-white"
                                          viewBox="0 0 12 12"
                                          fill="none"
                                        >
                                          <path
                                            d="M2 6l3 3 5-5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      )}
                                    </span>
                                    <span
                                      onClick={() => togglePrepTask(area.id, task)}
                                      className={`text-xs select-none transition-colors ${
                                        prepChecks[area.id]?.[task]
                                          ? "text-white/30 line-through"
                                          : "text-white/60 group-hover:text-white/80"
                                      }`}
                                    >
                                      {task}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              <div className="w-44 flex-shrink-0">
                                <textarea
                                  value={prepNotes[area.id] ?? ""}
                                  onChange={(e) =>
                                    setPrepNotes((prev) => ({
                                      ...prev,
                                      [area.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Notes..."
                                  rows={3}
                                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/55 placeholder:text-white/20 outline-none focus:border-accent-orange/40 focus:bg-white/[0.06] transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
