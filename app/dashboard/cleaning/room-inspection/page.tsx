"use client";

import { useState, useEffect } from "react";
import { useStaffAssignments } from "@/components/providers/StaffAssignmentProvider";
import { STAFF } from "@/lib/data/staff";
import {
  FLOORS,
  AREAS,
  INIT_CHECKED_OUT,
  INIT_DAMAGE_NOTES,
  INIT_PREP_CHECKS,
  LS_KEYS,
  type CheckedState,
  type NoteState,
  type PrepCheckState,
  safeLS,
} from "@/lib/data/cleaningChecklist";

export default function CleaningSubtab2Page() {
  const { dbStaff } = useStaffAssignments();

  const [checkedOut, setCheckedOut] = useState<CheckedState>(() =>
    typeof window === "undefined" ? INIT_CHECKED_OUT : safeLS(LS_KEYS.checkout, INIT_CHECKED_OUT)
  );
  const [damageNotes, setDamageNotes] = useState<NoteState>(() =>
    typeof window === "undefined" ? INIT_DAMAGE_NOTES : safeLS(LS_KEYS.damage, INIT_DAMAGE_NOTES)
  );

  useEffect(() => {
    localStorage.setItem(LS_KEYS.checkout, JSON.stringify(checkedOut));
  }, [checkedOut]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.damage, JSON.stringify(damageNotes));
  }, [damageNotes]);

  const toggleCheckOut = (areaId: string) => {
    const willBeOut = !checkedOut[areaId];
    setCheckedOut((prev) => ({ ...prev, [areaId]: willBeOut }));
    // When marking a room as vacant, also clear its prep checks in localStorage
    // so the Area Prep tab reflects the reset when navigated to
    if (willBeOut) {
      const currentPrep: PrepCheckState = safeLS(LS_KEYS.prepChecks, INIT_PREP_CHECKS);
      const cleared: Record<string, boolean> = {};
      Object.keys(currentPrep[areaId] ?? {}).forEach((t) => (cleared[t] = false));
      localStorage.setItem(
        LS_KEYS.prepChecks,
        JSON.stringify({ ...currentPrep, [areaId]: cleared })
      );
    }
  };

  const vacantCount = Object.values(checkedOut).filter(Boolean).length;
  const totalCount = AREAS.length;
  const onDutyStaff = STAFF.filter((s) => s.status === "On Duty" || s.status === "On Standby");

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-12 gap-5">

        {/* ── LEFT SIDEBAR ── */}
        <div className="col-span-4 space-y-4">

          {/* CHECKOUT STATUS SUMMARY */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-5 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Checkout Status
              </h2>
              <span className="font-mono text-[10px] text-white/25">
                {vacantCount}/{totalCount} cleared
              </span>
            </div>

            <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.08] mb-5 mt-2">
              <div
                className="h-full rounded-full bg-accent-blue transition-all duration-500"
                style={{ width: `${Math.round((vacantCount / totalCount) * 100)}%` }}
              />
            </div>

            <div className="space-y-4">
              {FLOORS.map((floor) => (
                <div key={floor.id}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 mb-2">
                    {floor.label}
                  </p>
                  <div className="space-y-1.5">
                    {floor.areas.map((area) => {
                      const isVacant = checkedOut[area.id];
                      return (
                        <div key={area.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                                isVacant
                                  ? "bg-accent-blue shadow-[0_0_6px_var(--color-accent-blue)]"
                                  : "bg-accent-red shadow-[0_0_6px_var(--color-accent-red)]"
                              }`}
                            />
                            <span className="text-[11px] text-white/55 truncate">{area.label}</span>
                          </div>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 transition-all duration-300 ${
                              isVacant
                                ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                                : "bg-accent-red/10 border-accent-red/20 text-accent-red"
                            }`}
                          >
                            {isVacant ? "Vacant" : "Checking"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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

        {/* ── RIGHT — POST CHECK-OUT CHECKLIST ── */}
        <div className="col-span-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] p-6 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.025)_0%,transparent_60%)]" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Post Check-Out Checklist
              </h2>
              <span className="font-mono text-[10px] text-white/25">
                {vacantCount}/{totalCount} cleared
              </span>
            </div>

            <div className="space-y-6">
              {FLOORS.map((floor) => (
                <div key={floor.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
                      {floor.label}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <div className="space-y-3">
                    {floor.areas.map((area) => {
                      const isVacant = checkedOut[area.id];
                      return (
                        <div
                          key={area.id}
                          className={`rounded-2xl border p-4 transition-all duration-300 ${
                            isVacant
                              ? "border-accent-blue/20 bg-accent-blue/[0.04]"
                              : "border-white/[0.07] bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => toggleCheckOut(area.id)}
                              className={`flex-shrink-0 h-5 w-5 rounded-[5px] border flex items-center justify-center transition-all duration-150 ${
                                isVacant
                                  ? "bg-accent-blue border-accent-blue"
                                  : "bg-white/[0.04] border-white/[0.15] hover:border-white/30"
                              }`}
                            >
                              {isVacant && (
                                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M2 6l3 3 5-5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>

                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                                    isVacant
                                      ? "bg-accent-blue shadow-[0_0_6px_var(--color-accent-blue)]"
                                      : "bg-accent-red shadow-[0_0_6px_var(--color-accent-red)]"
                                  }`}
                                />
                                <h3
                                  className={`text-sm font-semibold transition-colors duration-300 ${
                                    isVacant ? "text-white/35 line-through" : "text-white/90"
                                  }`}
                                >
                                  {area.label}
                                </h3>
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-300 ${
                                  isVacant
                                    ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                                    : "bg-accent-red/10 border-accent-red/20 text-accent-red"
                                }`}
                              >
                                {isVacant ? "Vacant" : "Checking"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 ml-9">
                            <textarea
                              value={damageNotes[area.id]}
                              onChange={(e) =>
                                setDamageNotes((prev) => ({ ...prev, [area.id]: e.target.value }))
                              }
                              placeholder="Note any damages or issues..."
                              rows={2}
                              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/55 placeholder:text-white/20 outline-none focus:border-accent-red/40 focus:bg-white/[0.06] transition-colors"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
