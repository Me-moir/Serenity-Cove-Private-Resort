"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise,
  ChevronLeft,
  ChevronRight,
  Funnel,
  PencilFill,
  Search,
  TrashFill,
  X,
} from "react-bootstrap-icons";
import { updateIncident, deleteIncident } from "@/app/actions/incidents";

interface Incident {
  incident_id: number;
  guest_id: number;
  reservation_id: number | null;
  description: string;
  status: "None" | "Reported" | "Pending" | "Resolved";
  reported_at: string;
  resolved_at: string | null;
  guests: { first_name: string; last_name: string } | null;
  reservations: { order_id: string } | null;
}

interface Props {
  incidents: Incident[];
}

const PAGE_SIZE = 10;

const STATUSES = ["None", "Reported", "Pending", "Resolved"] as const;

function fmtDatetime(ts: string) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
}

function getPageNums(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const nums: (number | "…")[] = [1];
  if (cur > 3) nums.push("…");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) nums.push(i);
  if (cur < total - 2) nums.push("…");
  nums.push(total);
  return nums;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    None: "border border-border text-text-muted",
    Reported: "bg-topbar text-white",
    Pending: "bg-accent-orange/15 text-accent-orange",
    Resolved: "bg-accent-green/15 text-accent-green",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${map[status] ?? "bg-border text-text-muted"}`}>
      {status}
    </span>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition";
const selectCls =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light focus:border-[#9a9a9a] focus:outline-none transition appearance-none";

function FL({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-text-muted">{children}</label>;
}

export default function IncidentRecords({ incidents }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /* UI state */
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  /* Edit state */
  const [editTarget, setEditTarget] = useState<Incident | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    status: "None" as Incident["status"],
    resolved_at: "",
  });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  /* Delete state */
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return incidents.filter((inc) => {
      if (filterStatus !== "All" && inc.status !== filterStatus) return false;
      if (!q) return true;
      const guestName = inc.guests
        ? `${inc.guests.first_name} ${inc.guests.last_name}`.toLowerCase()
        : "";
      return (
        guestName.includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.status.toLowerCase().includes(q) ||
        (inc.reservations?.order_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [incidents, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeP = Math.min(page, totalPages);
  const paginated = filtered.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);

  function goPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  const setEF = (k: string, v: string) => setEditForm((p) => ({ ...p, [k]: v }));

  function openEdit(inc: Incident) {
    setEditForm({
      description: inc.description,
      status: inc.status,
      resolved_at: inc.resolved_at ? inc.resolved_at.slice(0, 10) : "",
    });
    setEditError("");
    setEditTarget(inc);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.description.trim()) return setEditError("Description is required.");
    setSaving(true);
    setEditError("");
    try {
      await updateIncident(editTarget.incident_id, {
        description: editForm.description.trim(),
        status: editForm.status,
        resolved_at: editForm.resolved_at || null,
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
      await deleteIncident(deleteTarget.incident_id);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">

      <h1 className="text-3xl font-bold tracking-tight text-text-on-light">
        Incident <span className="font-light text-text-muted">Records</span>
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
              placeholder="Search by guest, description, or order..."
              className="h-9 w-full rounded-xl border border-border bg-shell pl-8 pr-4 text-sm text-text-on-light placeholder:text-text-muted transition focus:border-[#9a9a9a] focus:outline-none"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter((p) => !p)}
              className={`flex h-9 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                filterStatus !== "All"
                  ? "border-topbar bg-topbar text-white"
                  : "border-border text-text-muted hover:border-[#9a9a9a] hover:text-text-on-light"
              }`}
            >
              <Funnel size={13} />
              Filter
              {filterStatus !== "All" && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px]">
                  {filterStatus}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-2xl border border-border bg-card-light shadow-lg">
                {["All", ...STATUSES].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setFilterStatus(s); setShowFilter(false); setPage(1); }}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition ${
                      filterStatus === s ? "bg-topbar text-white" : "hover:bg-shell text-text-on-light"
                    }`}
                  >
                    {s === "All" ? "All Statuses" : s}
                  </button>
                ))}
              </div>
            )}
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
                {["Guest", "Reservation", "Description", "Status", "Reported At", "Resolved At", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60
                      ${i === 0 ? "pl-6 pr-4 text-left" : "px-4 text-left"}
                      ${i === 6 ? "pr-6" : ""}
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
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-text-muted">
                    {search || filterStatus !== "All"
                      ? "No incidents match the current filter."
                      : "No incidents found."}
                  </td>
                </tr>
              ) : (
                paginated.map((inc) => (
                  <tr key={inc.incident_id} className="transition-colors hover:bg-shell/60">

                    {/* Guest */}
                    <td className="py-4 pl-6 pr-4">
                      <span className="text-sm font-semibold">
                        {inc.guests
                          ? `${inc.guests.first_name} ${inc.guests.last_name}`
                          : "—"}
                      </span>
                    </td>

                    {/* Reservation */}
                    <td className="px-4 py-4">
                      {inc.reservations?.order_id ? (
                        <span className="rounded-lg bg-shell px-2.5 py-1 font-mono text-[11px] text-text-muted">
                          {inc.reservations.order_id}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-4 max-w-[240px]">
                      <p className="line-clamp-2 text-sm text-text-muted">{inc.description}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={inc.status} />
                    </td>

                    {/* Reported At */}
                    <td className="px-4 py-4">
                      <span className="text-[11px] text-text-muted leading-snug">
                        {fmtDatetime(inc.reported_at)}
                      </span>
                    </td>

                    {/* Resolved At */}
                    <td className="px-4 py-4">
                      {inc.resolved_at ? (
                        <span className="text-[11px] text-accent-green leading-snug">
                          {fmtDatetime(inc.resolved_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit incident"
                          onClick={() => openEdit(inc)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue"
                        >
                          <PencilFill size={12} />
                        </button>
                        <button
                          type="button"
                          title="Delete incident"
                          onClick={() => setDeleteTarget(inc)}
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
                  Delete Incident Record
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-text-muted">
                You are about to permanently delete the incident for{" "}
                <span className="font-semibold text-text-on-light">
                  {deleteTarget.guests
                    ? `${deleteTarget.guests.first_name} ${deleteTarget.guests.last_name}`
                    : "this guest"}
                </span>
                . This action cannot be undone.
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
                {deleting ? "Deleting..." : "Yes, Delete"}
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
                  Edit Record
                </div>
                <div className="mt-0.5 text-lg font-semibold text-white">
                  Incident #{editTarget.incident_id}
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
                    Incident Details
                  </legend>
                  <div className="space-y-4">
                    <div>
                      <FL>Description</FL>
                      <textarea
                        required
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEF("description", e.target.value)}
                        placeholder="Describe the incident..."
                        className="w-full resize-none rounded-xl border border-border bg-shell px-3 py-2.5 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FL>Status</FL>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEF("status", e.target.value)}
                          className={selectCls}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FL>Resolved At</FL>
                        <input
                          type="date"
                          value={editForm.resolved_at}
                          onChange={(e) => setEF("resolved_at", e.target.value)}
                          className={inputCls}
                        />
                      </div>
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
