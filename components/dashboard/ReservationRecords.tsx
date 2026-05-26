"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise,
  ChevronLeft,
  ChevronRight,
  CheckCircleFill,
  Funnel,
  PencilFill,
  PlusLg,
  Search,
  Trash3,
  TrashFill,
  X,
  XCircleFill,
} from "react-bootstrap-icons";
import {
  updateReservationRecord,
  deleteReservation,
} from "@/app/actions/reservations";

interface BookedVenue {
  price_snapshot: number;
  venue_price_list: { venue_name: string; category: string } | null;
}

interface VenueOption {
  venue_id: number;
  venue_name: string;
  category: string;
  price_per_night: number;
}

interface SelectedVenue {
  venue_id: number;
  price_snapshot: number;
}

interface Reservation {
  reservation_id: number;
  order_id: string;
  guest_id: number;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  adult_count: number;
  children_count: number;
  total_price: number;
  payment_status: string;
  approval_status: "Pending" | "Approved" | "Rejected";
  booking_source: string;
  special_notes: string | null;
  created_at: string;
  actioned_at: string | null;
  guests: { first_name: string; last_name: string; guest_type: string } | null;
  reservation_venues: BookedVenue[];
}

interface Props {
  reservations: Reservation[];
  venues: VenueOption[];
}

const PAGE_SIZE = 10;

const PHP = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0
    ? `${hour}${period}`
    : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

function fmtActionedAt(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

function StatusBadge({ status }: { status: "Pending" | "Approved" | "Rejected" }) {
  if (status === "Approved")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-accent-green">
        <CheckCircleFill size={9} />
        Approved
      </span>
    );
  if (status === "Rejected")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-red/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-accent-red">
        <XCircleFill size={9} />
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-accent-orange/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-accent-orange">
      Pending
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    Suite: "bg-accent-orange/15 text-accent-orange",
    "Standard Room": "bg-accent-blue/15 text-accent-blue",
    Amenity: "bg-accent-green/15 text-accent-green",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${map[category] ?? "bg-shell text-text-muted"}`}>
      {category}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Fully Paid": "bg-accent-green/15 text-accent-green",
    "Partially Paid": "bg-accent-blue/15 text-accent-blue",
    Pending: "bg-accent-orange/15 text-accent-orange",
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

export default function ReservationRecords({ reservations, venues }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /* UI state */
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  /* Edit state */
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState({
    approval_status: "Pending" as "Pending" | "Approved" | "Rejected",
    payment_status: "Pending",
    check_in_date: "",
    check_in_time: "14:00",
    check_out_date: "",
    check_out_time: "12:00",
    adult_count: "1",
    children_count: "0",
    special_notes: "",
  });
  const [editVenues, setEditVenues] = useState<SelectedVenue[]>([]);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  /* Delete state */
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* Venues grouped by category for <optgroup> */
  const venuesByCategory = useMemo(() => {
    const map: Record<string, VenueOption[]> = {};
    for (const v of venues) {
      if (!map[v.category]) map[v.category] = [];
      map[v.category].push(v);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [venues]);

  /* IDs already picked (prevents duplicates within the same edit) */
  const usedVenueIds = useMemo(
    () => new Set(editVenues.map((v) => v.venue_id).filter((id) => id > 0)),
    [editVenues],
  );

  /* Auto-computed total from selected venues */
  const editTotalPrice = editVenues.reduce((s, v) => s + v.price_snapshot, 0);

  /* Venue helpers */
  const addVenueRow = () =>
    setEditVenues((p) => [...p, { venue_id: 0, price_snapshot: 0 }]);

  const updateVenueRow = (i: number, venueId: number) => {
    const found = venues.find((v) => v.venue_id === venueId);
    setEditVenues((p) =>
      p.map((row, idx) =>
        idx === i ? { venue_id: venueId, price_snapshot: found?.price_per_night ?? 0 } : row,
      ),
    );
  };

  const removeVenueRow = (i: number) =>
    setEditVenues((p) => p.filter((_, idx) => idx !== i));

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reservations.filter((r) => {
      if (filterStatus !== "All" && r.approval_status !== filterStatus) return false;
      if (!q) return true;
      const guestName = r.guests
        ? `${r.guests.first_name} ${r.guests.last_name}`.toLowerCase()
        : "";
      return (
        guestName.includes(q) ||
        r.order_id.toLowerCase().includes(q) ||
        r.payment_status.toLowerCase().includes(q)
      );
    });
  }, [reservations, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeP = Math.min(page, totalPages);
  const paginated = filtered.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);

  function goPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  /* Edit helpers */
  const setEF = (k: string, v: string) => setEditForm((p) => ({ ...p, [k]: v }));

  function openEdit(r: Reservation) {
    setEditForm({
      approval_status: r.approval_status as "Pending" | "Approved" | "Rejected",
      payment_status: r.payment_status,
      check_in_date: r.check_in_date,
      check_in_time: r.check_in_time,
      check_out_date: r.check_out_date,
      check_out_time: r.check_out_time,
      adult_count: String(r.adult_count),
      children_count: String(r.children_count),
      special_notes: r.special_notes ?? "",
    });
    setEditVenues(
      (r.reservation_venues ?? [])
        .filter((v) => v.venue_price_list)
        .map((v) => {
          const match = venues.find(
            (opt) => opt.venue_name === v.venue_price_list!.venue_name,
          );
          return {
            venue_id: match?.venue_id ?? 0,
            price_snapshot: v.price_snapshot,
          };
        }),
    );
    setEditError("");
    setEditTarget(r);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.check_in_date || !editForm.check_out_date)
      return setEditError("Check-in and check-out dates are required.");
    if (editVenues.length === 0)
      return setEditError("Please add at least one venue.");
    if (editVenues.some((v) => v.venue_id === 0))
      return setEditError("Please select a venue for every row.");
    setSaving(true);
    setEditError("");
    try {
      await updateReservationRecord(
        editTarget.reservation_id,
        {
          approval_status: editForm.approval_status,
          payment_status: editForm.payment_status,
          check_in_date: editForm.check_in_date,
          check_in_time: editForm.check_in_time,
          check_out_date: editForm.check_out_date,
          check_out_time: editForm.check_out_time,
          adult_count: Number(editForm.adult_count),
          children_count: Number(editForm.children_count),
          total_price: editTotalPrice,
          special_notes: editForm.special_notes.trim() || null,
        },
        editVenues,
      );
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
      await deleteReservation(deleteTarget.reservation_id);
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
        Reservation <span className="font-light text-text-muted">Records</span>
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
              placeholder="Search by guest or order ID..."
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
                {["All", "Pending", "Approved", "Rejected"].map((s) => (
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
                {["Guest", "Order ID", "Status", "Actioned At", "Stay", "Venues", "Price", "Payment", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60
                      ${i === 0 ? "pl-6 pr-4 text-left" : "px-4 text-left"}
                      ${i === 8 ? "pr-6" : ""}
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
                  <td colSpan={9} className="px-6 py-14 text-center text-sm text-text-muted">
                    {search || filterStatus !== "All"
                      ? "No records match the current filter."
                      : "No processed reservations yet."}
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.reservation_id} className="transition-colors hover:bg-shell/60">

                    {/* Guest */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="text-sm font-semibold">
                        {r.guests ? `${r.guests.first_name} ${r.guests.last_name}` : "—"}
                      </div>
                      {r.guests && (
                        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                          {r.guests.guest_type}
                        </div>
                      )}
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-shell px-2.5 py-1 font-mono text-[11px] text-text-muted">
                        {r.order_id}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={r.approval_status} />
                    </td>

                    {/* Actioned At */}
                    <td className="px-4 py-4">
                      <div className="text-[11px] text-text-on-light leading-snug">
                        {fmtActionedAt(r.actioned_at)}
                      </div>
                    </td>

                    {/* Stay */}
                    <td className="px-4 py-4">
                      <div className="text-[11px] leading-snug">
                        <div className="text-text-on-light">{fmtDate(r.check_in_date)} {fmtTime(r.check_in_time)}</div>
                        <div className="text-text-muted">→ {fmtDate(r.check_out_date)} {fmtTime(r.check_out_time)}</div>
                      </div>
                    </td>

                    {/* Venues */}
                    <td className="px-4 py-4">
                      {r.reservation_venues?.length > 0 ? (
                        <div className="space-y-1">
                          {r.reservation_venues.map((v, idx) =>
                            v.venue_price_list ? (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="text-[11px] text-text-on-light">{v.venue_price_list.venue_name}</span>
                                <CategoryBadge category={v.venue_price_list.category} />
                              </div>
                            ) : null
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold">{PHP(r.total_price)}</span>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-4">
                      <PaymentBadge status={r.payment_status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit record"
                          onClick={() => openEdit(r)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue"
                        >
                          <PencilFill size={12} />
                        </button>
                        <button
                          type="button"
                          title="Delete record"
                          onClick={() => setDeleteTarget(r)}
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
                  Delete Reservation Record
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-text-muted">
                You are about to permanently delete reservation{" "}
                <span className="font-mono font-semibold text-text-on-light">
                  {deleteTarget.order_id}
                </span>{" "}
                for{" "}
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
          <div className="relative w-full max-w-xl rounded-3xl bg-card-light shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-3xl bg-topbar px-6 py-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Edit Record
                </div>
                <div className="mt-0.5 text-lg font-semibold text-white">
                  {editTarget.order_id}
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

                {/* Status */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Status
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FL>Approval Status</FL>
                      <select
                        value={editForm.approval_status}
                        onChange={(e) => setEF("approval_status", e.target.value)}
                        className={selectCls}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <FL>Payment Status</FL>
                      <select
                        value={editForm.payment_status}
                        onChange={(e) => setEF("payment_status", e.target.value)}
                        className={selectCls}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Fully Paid">Fully Paid</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* Dates */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Stay Dates
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FL>Check-in Date</FL>
                      <input
                        required
                        type="date"
                        value={editForm.check_in_date}
                        onChange={(e) => setEF("check_in_date", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Check-in Time</FL>
                      <input
                        type="time"
                        value={editForm.check_in_time}
                        onChange={(e) => setEF("check_in_time", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Check-out Date</FL>
                      <input
                        required
                        type="date"
                        value={editForm.check_out_date}
                        onChange={(e) => setEF("check_out_date", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Check-out Time</FL>
                      <input
                        type="time"
                        value={editForm.check_out_time}
                        onChange={(e) => setEF("check_out_time", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Headcount */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Headcount
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FL>Adults</FL>
                      <input
                        type="number"
                        min="0"
                        value={editForm.adult_count}
                        onChange={(e) => setEF("adult_count", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Children</FL>
                      <input
                        type="number"
                        min="0"
                        value={editForm.children_count}
                        onChange={(e) => setEF("children_count", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Venues & Pricing */}
                <fieldset>
                  <div className="mb-3 flex items-center justify-between">
                    <legend className="text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                      Venues & Pricing
                    </legend>
                    <button
                      type="button"
                      onClick={addVenueRow}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light"
                    >
                      <PlusLg size={9} />
                      Add venue
                    </button>
                  </div>

                  {editVenues.length === 0 ? (
                    <p className="text-xs text-text-muted">
                      No venues added. Click &quot;Add venue&quot; to begin.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {editVenues.map((row, i) => {
                        const venueInfo = venues.find((v) => v.venue_id === row.venue_id);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <select
                              value={row.venue_id === 0 ? "" : row.venue_id}
                              onChange={(e) => updateVenueRow(i, Number(e.target.value))}
                              className="h-10 flex-1 rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light focus:border-[#9a9a9a] focus:outline-none transition appearance-none"
                            >
                              <option value="">Select a venue...</option>
                              {venuesByCategory.map(([cat, catVenues]) => (
                                <optgroup key={cat} label={cat}>
                                  {catVenues.map((v) => (
                                    <option
                                      key={v.venue_id}
                                      value={v.venue_id}
                                      disabled={usedVenueIds.has(v.venue_id) && v.venue_id !== row.venue_id}
                                    >
                                      {v.venue_name}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <div className="flex h-10 w-32 shrink-0 items-center justify-end rounded-xl border border-border bg-shell/50 px-3 text-sm font-semibold tabular-nums text-text-on-light">
                              {row.venue_id > 0 ? PHP(row.price_snapshot) : "₱ —"}
                            </div>
                            {venueInfo && (
                              <span className="hidden shrink-0 rounded-full bg-shell px-2 py-0.5 text-[10px] text-text-muted sm:inline">
                                {venueInfo.category}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeVenueRow(i)}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-accent-red hover:text-accent-red"
                              aria-label="Remove venue"
                            >
                              <Trash3 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {editVenues.length > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-shell/60 px-4 py-3">
                      <div className="text-xs font-medium text-text-muted">
                        Total · {editVenues.filter((v) => v.venue_id > 0).length}{" "}
                        {editVenues.filter((v) => v.venue_id > 0).length === 1 ? "venue" : "venues"}
                      </div>
                      <div className="text-base font-bold tabular-nums text-text-on-light">
                        {PHP(editTotalPrice)}
                      </div>
                    </div>
                  )}
                </fieldset>

                {/* Notes */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Notes
                  </legend>
                  <textarea
                    rows={3}
                    value={editForm.special_notes}
                    onChange={(e) => setEF("special_notes", e.target.value)}
                    placeholder="Special requests or notes..."
                    className="w-full resize-none rounded-xl border border-border bg-shell px-3 py-2.5 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                  />
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
