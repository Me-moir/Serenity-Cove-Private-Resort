"use client";

import { useState } from "react";
import { PencilFill, XLg } from "react-bootstrap-icons";
import { ALL_AREA_NAMES } from "@/lib/data/venueAreas";
import { useStaffAssignments, type DbStaff } from "@/components/providers/StaffAssignmentProvider";

// ─── Color palette (cycles by index) ────────────────────────────────────────

const COLORS = ["blue", "green", "orange"] as const;
type Color = (typeof COLORS)[number];

const AVATAR_CLS: Record<Color, string> = {
  blue:   "bg-accent-blue/25 text-accent-blue",
  green:  "bg-accent-green/25 text-accent-green",
  orange: "bg-accent-orange/20 text-accent-orange",
};

const TAG_CLS: Record<Color, string> = {
  blue:   "bg-accent-blue/15 text-accent-blue",
  green:  "bg-accent-green/15 text-accent-green",
  orange: "bg-accent-orange/15 text-accent-orange",
};

// ─── Edit modal ─────────────────────────────────────────────────────────────

function EditModal({
  member,
  color,
  currentAreas,
  onSave,
  onCancel,
}: {
  member: DbStaff;
  color: Color;
  currentAreas: string[];
  onSave: (areas: string[]) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<string[]>([...currentAreas]);

  const remove = (area: string) => setDraft((p) => p.filter((a) => a !== area));
  const add = (area: string) => setDraft((p) => [...p, area]);
  const available = ALL_AREA_NAMES.filter((a) => !draft.includes(a));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-[#1A1A1E] shadow-2xl">

        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <div className="font-bold text-white">{member.staff_name}</div>
            <div className="mt-0.5 text-xs text-white/40">{member.role} · Edit assigned areas</div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-all"
          >
            <XLg size={13} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-5">

          {/* Current areas */}
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <div className="h-3 w-[3px] rounded-full bg-accent-blue/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Current Assignments
              </span>
            </div>
            {draft.length === 0 ? (
              <p className="text-xs text-white/25 italic">No areas assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {draft.map((area) => (
                  <span
                    key={area}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${TAG_CLS[color]}`}
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => remove(area)}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${area}`}
                    >
                      <XLg size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Available areas */}
          {available.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <div className="h-3 w-[3px] rounded-full bg-white/20" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Add Areas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {available.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => add(area)}
                    className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/40 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white/70"
                  >
                    + {area}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-1.5 text-sm text-white/40 transition hover:bg-white/[0.06] hover:text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-full bg-accent-blue px-5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function StaffTaskView() {
  const { dbStaff, assignments, updateStaffAreas } = useStaffAssignments();
  const [editing, setEditing] = useState<{ member: DbStaff; color: Color } | null>(null);

  const totalAreas = dbStaff.reduce(
    (sum, s) => sum + (assignments[String(s.staff_id)]?.length ?? 0),
    0,
  );

  const handleSave = (areas: string[]) => {
    if (editing) updateStaffAreas(String(editing.member.staff_id), areas);
    setEditing(null);
  };

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card-light shadow-md">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-bold text-text-on-light">Staff Task Board</h1>
            <p className="mt-0.5 text-xs text-text-muted">
              Grand Mansion Venue · Today&apos;s assignment overview
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 border-t border-border">
          {[
            { value: dbStaff.length, label: "Total Staff" },
            { value: totalAreas,     label: "Areas Covered" },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-3 ${i < 1 ? "border-r border-border" : ""}`}
            >
              <div className="text-xl font-extrabold tabular-nums text-text-on-light">{value}</div>
              <div className="text-[10px] text-text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Staff Grid ─────────────────────────────────────────── */}
      {dbStaff.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card-light p-12 text-center text-sm text-text-muted">
          Loading staff...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dbStaff.map((member, index) => {
            const color = COLORS[index % COLORS.length];
            const memberAreas = assignments[String(member.staff_id)] ?? [];

            return (
              <div
                key={member.staff_id}
                className="flex flex-col rounded-3xl border border-white/[0.07] bg-card-dark shadow-md"
              >
                {/* Card top */}
                <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${AVATAR_CLS[color]}`}
                    >
                      {member.staff_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm leading-tight text-white">{member.staff_name}</div>
                      <div className="mt-0.5 text-[11px] text-white/50">{member.role}</div>
                      {member.contact_number && (
                        <div className="mt-1 text-[10px] text-white/30">{member.contact_number}</div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing({ member, color })}
                    className="shrink-0 rounded-full p-1.5 text-white/25 transition-all hover:bg-white/[0.08] hover:text-white/60"
                    aria-label={`Edit ${member.staff_name}'s areas`}
                  >
                    <PencilFill size={11} />
                  </button>
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-white/[0.07]" />

                {/* Areas */}
                <div className="flex-1 px-5 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-3 w-[3px] rounded-full bg-white/30" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Assigned Areas
                    </span>
                  </div>
                  {memberAreas.length === 0 ? (
                    <p className="text-xs italic text-white/20">No areas assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {memberAreas.map((area) => (
                        <span
                          key={area}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${TAG_CLS[color]}`}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
                  <span className="text-[10px] text-white/25">ID #{member.staff_id}</span>
                  <span className="text-[10px] font-semibold text-white/40">
                    {memberAreas.length} {memberAreas.length === 1 ? "area" : "areas"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit modal ─────────────────────────────────────────── */}
      {editing && (
        <EditModal
          member={editing.member}
          color={editing.color}
          currentAreas={assignments[String(editing.member.staff_id)] ?? []}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
