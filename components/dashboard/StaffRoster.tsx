"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise,
  ChevronLeft,
  ChevronRight,
  PencilFill,
  Search,
  TrashFill,
  X,
} from "react-bootstrap-icons";
import { updateStaff, deleteStaff } from "@/app/actions/staff";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface StaffMember {
  staff_id: number;
  staff_name: string;
  role: string;
  contact_number: string | null;
}

interface Props {
  staff: StaffMember[];
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getPageNums(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const nums: (number | "…")[] = [1];
  if (cur > 3) nums.push("…");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) nums.push(i);
  if (cur < total - 2) nums.push("…");
  nums.push(total);
  return nums;
}

/* ─── Form helpers ───────────────────────────────────────────────────── */

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition";

function FL({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-text-muted">{children}</label>;
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function StaffRoster({ staff }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /* UI state */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  /* Edit state */
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({ staff_name: "", role: "", contact_number: "" });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  /* Delete state */
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.staff_name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        (s.contact_number ?? "").toLowerCase().includes(q),
    );
  }, [staff, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeP = Math.min(page, totalPages);
  const paginated = filtered.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);

  function goPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  const setEF = (k: string, v: string) => setEditForm((p) => ({ ...p, [k]: v }));

  function openEdit(s: StaffMember) {
    setEditForm({
      staff_name: s.staff_name,
      role: s.role,
      contact_number: s.contact_number ?? "",
    });
    setEditError("");
    setEditTarget(s);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.staff_name.trim()) return setEditError("Name is required.");
    if (!editForm.role.trim()) return setEditError("Role is required.");
    setSaving(true);
    setEditError("");
    try {
      await updateStaff(editTarget.staff_id, {
        staff_name: editForm.staff_name.trim(),
        role: editForm.role.trim(),
        contact_number: editForm.contact_number.trim() || null,
      });
      setEditTarget(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStaff(deleteTarget.staff_id);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="space-y-5">

      <h1 className="text-3xl font-bold tracking-tight text-text-on-light">
        Staff <span className="font-light text-text-muted">Roster</span>
      </h1>

      <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
          <div className="relative max-w-xs flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={13}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, role, or contact..."
              className="h-9 w-full rounded-xl border border-border bg-shell pl-8 pr-4 text-sm text-text-on-light placeholder:text-text-muted transition focus:border-[#9a9a9a] focus:outline-none"
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              startTransition(() => router.refresh());
              setTimeout(() => setRefreshing(false), 600);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-topbar hover:bg-topbar hover:text-white"
            aria-label="Refresh"
          >
            <ArrowClockwise size={14} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* Pagination */}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              disabled={safeP === 1}
              onClick={() => goPage(safeP - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-[#9a9a9a] disabled:opacity-30"
            >
              <ChevronLeft size={12} />
            </button>
            {getPageNums(safeP, totalPages).map((n, i) =>
              n === "…" ? (
                <span key={`e-${i}`} className="flex h-8 w-6 items-center justify-center text-xs text-text-muted">…</span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => goPage(n as number)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    n === safeP ? "bg-topbar text-white" : "border border-border text-text-muted hover:border-[#9a9a9a]"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={safeP === totalPages}
              onClick={() => goPage(safeP + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-[#9a9a9a] disabled:opacity-30"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-topbar">
                {["ID", "Name", "Role", "Contact Number", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60
                      ${i === 0 ? "pl-6 pr-4 text-left" : "px-4 text-left"}
                      ${i === 4 ? "pr-6" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-text-muted">
                    {search ? "No staff match the current search." : "No staff records found."}
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.staff_id} className="transition-colors hover:bg-shell/60">

                    {/* ID */}
                    <td className="py-4 pl-6 pr-4">
                      <span className="rounded-lg bg-shell px-2.5 py-1 font-mono text-[11px] text-text-muted">
                        #{s.staff_id}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-text-on-light">{s.staff_name}</span>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-border/60 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-text-on-light">
                        {s.role}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-text-muted">{s.contact_number ?? "—"}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit staff"
                          onClick={() => openEdit(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue"
                        >
                          <PencilFill size={12} />
                        </button>
                        <button
                          type="button"
                          title="Delete staff"
                          onClick={() => setDeleteTarget(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-accent-red hover:bg-accent-red/10 hover:text-accent-red"
                        >
                          <TrashFill size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-xs text-text-muted">
            {filtered.length === 0
              ? "No results"
              : `Showing ${(safeP - 1) * PAGE_SIZE + 1}–${Math.min(safeP * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <span className="text-xs text-text-muted">Page {safeP} of {totalPages}</span>
        </div>
      </div>

      {/* ── Delete Confirmation ───────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card-light shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 bg-accent-red/10 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-red/15 text-accent-red">
                <TrashFill size={16} />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-red/70">
                  Confirm Delete
                </div>
                <div className="mt-0.5 text-base font-semibold text-text-on-light">
                  Remove Staff Member
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-text-muted">
                You are about to permanently remove{" "}
                <span className="font-semibold text-text-on-light">{deleteTarget.staff_name}</span>{" "}
                from the roster. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-accent-red px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10 backdrop-blur-[2px]">
          <div className="relative w-full max-w-lg rounded-3xl bg-card-light shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between rounded-t-3xl bg-topbar px-6 py-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Edit Staff
                </div>
                <div className="mt-0.5 text-lg font-semibold text-white">
                  {editTarget.staff_name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-6">
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Staff Details
                  </legend>
                  <div className="space-y-4">
                    <div>
                      <FL>Full Name</FL>
                      <input
                        required
                        type="text"
                        value={editForm.staff_name}
                        onChange={(e) => setEF("staff_name", e.target.value)}
                        placeholder="Staff full name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Role</FL>
                      <input
                        required
                        type="text"
                        value={editForm.role}
                        onChange={(e) => setEF("role", e.target.value)}
                        placeholder="e.g. Housekeeper, Groundskeeper"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Contact Number</FL>
                      <input
                        type="text"
                        value={editForm.contact_number}
                        onChange={(e) => setEF("contact_number", e.target.value)}
                        placeholder="Optional phone number"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>

                {editError && (
                  <div className="rounded-xl bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
                    {editError}
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-topbar px-6 py-2.5 text-sm font-semibold text-text-on-dark transition hover:opacity-75 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
