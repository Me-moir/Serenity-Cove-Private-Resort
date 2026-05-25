"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise,
  CheckCircleFill,
  ClockHistory,
  HourglassSplit,
  PlusLg,
  Search,
  Trash3,
  X,
} from "react-bootstrap-icons";
import { addReservation, updateApprovalStatus } from "@/app/actions/reservations";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Addon {
  addon_name: string;
  addon_category: string | null;
}

interface BookedVenue {
  price_snapshot: number;
  venue_price_list: { venue_name: string; category: string } | null;
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
  approval_status: string;
  booking_source: string;
  special_notes: string | null;
  created_at: string;
  actioned_at: string | null;
  guests: { first_name: string; last_name: string; guest_type: string } | null;
  reservation_addons: Addon[];
  reservation_venues: BookedVenue[];
}

interface GuestOption {
  guest_id: number;
  first_name: string;
  last_name: string;
  guest_type: string;
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

interface Props {
  reservations: Reservation[];
  guests: GuestOption[];
  venues: VenueOption[];
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const PHP = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);

function fmt_date(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fmt_datetime(dt: string) {
  return new Date(dt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmt_time(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0
    ? `${hour}${period}`
    : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

const typeChip: Record<string, string> = {
  New: "bg-accent-blue/15 text-accent-blue",
  Returning: "bg-accent-green/15 text-accent-green",
  VIP: "bg-accent-orange/15 text-accent-orange",
};

const paymentColor: Record<string, string> = {
  Pending: "text-accent-orange",
  "Partially Paid": "text-accent-blue",
  "Fully Paid": "text-accent-green",
};

const approvalColor: Record<string, string> = {
  Pending: "text-accent-orange",
  Approved: "text-accent-green",
  Rejected: "text-accent-red",
};

/* ─── Stat Card ──────────────────────────────────────────────────────── */

function StatCard({
  icon,
  count,
  label,
  from,
  to,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-4xl font-bold tabular-nums leading-none">{count}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 leading-snug">
            {label}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
    </div>
  );
}

/* ─── Form field helpers ─────────────────────────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-text-muted">
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition";

const selectClass =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light focus:border-[#9a9a9a] focus:outline-none transition appearance-none";

/* ─── Initial form state ─────────────────────────────────────────────── */

const BLANK_FORM = {
  guest_id: "",
  check_in_date: "",
  check_in_time: "14:00",
  check_out_date: "",
  check_out_time: "12:00",
  adult_count: "1",
  children_count: "0",
  payment_status: "Pending",
  approval_status: "Pending",
  booking_source: "Website",
  special_notes: "",
};

/* ─── Main component ─────────────────────────────────────────────────── */

export default function ReservationApproval({ reservations, guests, venues }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [addons, setAddons] = useState<{ addon_name: string; addon_category: string }[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<SelectedVenue[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Today's date in YYYY-MM-DD for date input min attributes */
  const today = new Date().toISOString().slice(0, 10);

  /* Stat counts — all from the pending-only prop */
  const pendingCount = reservations.length;
  const fullyPaidCount = reservations.filter((r) => r.payment_status === "Fully Paid").length;
  const partialCount = reservations.filter((r) => r.payment_status === "Partially Paid").length;

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reservations;
    return reservations.filter(
      (r) =>
        `${r.guests?.first_name} ${r.guests?.last_name}`.toLowerCase().includes(q) ||
        r.order_id.toLowerCase().includes(q) ||
        r.guests?.guest_type.toLowerCase().includes(q) ||
        r.payment_status.toLowerCase().includes(q) ||
        r.approval_status.toLowerCase().includes(q) ||
        r.reservation_addons.some((a) => a.addon_name.toLowerCase().includes(q)),
    );
  }, [reservations, search]);

  /* Venues grouped by category for <optgroup> */
  const venuesByCategory = useMemo(() => {
    const map: Record<string, VenueOption[]> = {};
    for (const v of venues) {
      if (!map[v.category]) map[v.category] = [];
      map[v.category].push(v);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [venues]);

  /* IDs already picked (to prevent duplicates) */
  const usedVenueIds = useMemo(
    () => new Set(selectedVenues.map((v) => v.venue_id).filter((id) => id > 0)),
    [selectedVenues],
  );

  /* Auto-computed total */
  const totalPrice = selectedVenues.reduce((s, v) => s + v.price_snapshot, 0);

  /* Approve / Reject */
  async function handleAction(id: number, status: "Approved" | "Rejected") {
    setActionId(id);
    try {
      await updateApprovalStatus(id, status);
      startTransition(() => router.refresh());
    } catch {
      // silently ignore — row will re-render on next refresh
    } finally {
      setActionId(null);
    }
  }

  /* Form helpers */
  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  /* Venue helpers */
  const addVenueRow = () =>
    setSelectedVenues((p) => [...p, { venue_id: 0, price_snapshot: 0 }]);

  const updateVenueRow = (i: number, venueId: number) => {
    const found = venues.find((v) => v.venue_id === venueId);
    setSelectedVenues((p) =>
      p.map((row, idx) =>
        idx === i
          ? { venue_id: venueId, price_snapshot: found?.price_per_night ?? 0 }
          : row,
      ),
    );
  };

  const removeVenueRow = (i: number) =>
    setSelectedVenues((p) => p.filter((_, idx) => idx !== i));

  /* Add-on helpers */
  const addAddon = () =>
    setAddons((p) => [...p, { addon_name: "", addon_category: "" }]);
  const updateAddon = (
    i: number,
    f: "addon_name" | "addon_category",
    v: string,
  ) => setAddons((p) => p.map((a, idx) => (idx === i ? { ...a, [f]: v } : a)));
  const removeAddon = (i: number) =>
    setAddons((p) => p.filter((_, idx) => idx !== i));

  /* Submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const guestId = parseInt(form.guest_id, 10);
    if (!guestId || guestId <= 0) return setFormError("Please select a guest.");
    if (!form.check_in_date || !form.check_out_date)
      return setFormError("Check-in and check-out dates are required.");
    if (form.check_in_date < today)
      return setFormError("Check-in date cannot be in the past.");
    if (form.check_out_date <= form.check_in_date)
      return setFormError("Check-out date must be after the check-in date.");
    if (selectedVenues.length === 0)
      return setFormError("Please add at least one venue.");
    if (selectedVenues.some((v) => v.venue_id === 0))
      return setFormError("Please select a venue for every row.");

    setSubmitting(true);

    const validAddons = addons
      .filter((a) => a.addon_name.trim())
      .map((a) => ({
        addon_name: a.addon_name.trim(),
        addon_category: a.addon_category.trim() || null,
      }));

    try {
      await addReservation(
        {
          guest_id: guestId,
          check_in_date: form.check_in_date,
          check_in_time: form.check_in_time,
          check_out_date: form.check_out_date,
          check_out_time: form.check_out_time,
          adult_count: Number(form.adult_count),
          children_count: Number(form.children_count),
          total_price: totalPrice,
          payment_status: form.payment_status,
          approval_status: form.approval_status,
          booking_source: form.booking_source,
          special_notes: form.special_notes.trim() || null,
        },
        validAddons,
        selectedVenues,
      );
      setForm(BLANK_FORM);
      setAddons([]);
      setSelectedVenues([]);
      setShowModal(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setForm(BLANK_FORM);
    setAddons([]);
    setSelectedVenues([]);
    setFormError("");
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">

      {/* Page title */}
      <h1 className="text-3xl font-bold tracking-tight text-text-on-light">
        Reservation{" "}
        <span className="font-light text-text-muted">Approval</span>
      </h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ClockHistory size={22} />}
          count={pendingCount}
          label="Awaiting Approval"
          from="#D4860A"
          to="#A86300"
        />
        <StatCard
          icon={<CheckCircleFill size={22} />}
          count={fullyPaidCount}
          label="Fully Paid · Pending"
          from="#2E5A28"
          to="#1C3A18"
        />
        <StatCard
          icon={<HourglassSplit size={22} />}
          count={partialCount}
          label="Partially Paid · Pending"
          from="#2C2C2C"
          to="#141414"
        />
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">

        {/* Search + Add */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="relative max-w-sm flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={13}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reservation..."
              className="h-9 w-full rounded-xl border border-border bg-shell pl-8 pr-4 text-sm text-text-on-light placeholder:text-text-muted transition focus:border-[#9a9a9a] focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              router.refresh();
              await new Promise((r) => setTimeout(r, 600));
              setRefreshing(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light disabled:opacity-40"
            aria-label="Refresh table"
            title="Refresh"
          >
            <ArrowClockwise
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowModal(true);
            }}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-topbar px-4 text-sm font-medium text-text-on-dark transition hover:opacity-75"
          >
            <PlusLg size={13} />
            Add
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-topbar">
                {[
                  "Guest Name",
                  "Order ID",
                  "Guest Type",
                  "Dates Booked",
                  "Headcount",
                  "Venues",
                  "Total Price",
                  "Payment Status",
                  "Requests",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60
                      ${i === 0 ? "pl-6 pr-4 text-left" : "px-4 text-left"}
                      ${i === 9 ? "pr-6" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-14 text-center text-sm text-text-muted">
                    {search
                      ? "No reservations match your search."
                      : "No pending reservations. All reservations have been processed."}
                  </td>
                </tr>
              ) : (
                filtered.map((res) => {
                  const loading = actionId === res.reservation_id;
                  return (
                    <tr
                      key={res.reservation_id}
                      className="transition-colors hover:bg-shell/70"
                    >
                      {/* Guest Name */}
                      <td className="py-4 pl-6 pr-4">
                        <span className="font-semibold text-sm leading-tight">
                          {res.guests ? `${res.guests.first_name} ${res.guests.last_name}` : "—"}
                        </span>
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-shell px-2.5 py-1 font-mono text-[11px] text-text-muted">
                          #{res.order_id}
                        </span>
                      </td>

                      {/* Guest Type */}
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                            typeChip[res.guests?.guest_type ?? ""] ??
                            "bg-black/10 text-text-muted"
                          }`}
                        >
                          {res.guests?.guest_type ?? "—"}
                        </span>
                      </td>

                      {/* Dates Booked */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium leading-snug">
                          {fmt_date(res.check_in_date)} – {fmt_date(res.check_out_date)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-text-muted">
                          {fmt_time(res.check_in_time)} – {fmt_time(res.check_out_time)}
                        </div>
                      </td>

                      {/* Headcount */}
                      <td className="px-4 py-4">
                        <div className="text-sm leading-snug">
                          {res.adult_count > 0 && (
                            <div>{res.adult_count} Adult{res.adult_count !== 1 ? "s" : ""}</div>
                          )}
                          {res.children_count > 0 && (
                            <div className="text-text-muted">
                              {res.children_count} Kid{res.children_count !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Venues */}
                      <td className="px-4 py-4">
                        {res.reservation_venues?.length > 0 ? (
                          <div className="space-y-1">
                            {res.reservation_venues.map((rv, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="text-xs text-text-on-light leading-snug">
                                  {rv.venue_price_list?.venue_name ?? "—"}
                                </span>
                                <span className="shrink-0 rounded-full bg-shell px-1.5 py-0.5 text-[9px] text-text-muted">
                                  {rv.venue_price_list?.category}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Total Price */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold tabular-nums">
                          {PHP(Number(res.total_price))}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div
                          className={`text-sm font-semibold ${paymentColor[res.payment_status] ?? "text-text-muted"}`}
                        >
                          {res.payment_status}
                        </div>
                      </td>

                      {/* Requests */}
                      <td className="px-4 py-4">
                        {res.reservation_addons.length > 0 ? (
                          <div className="space-y-0.5">
                            {res.reservation_addons.map((a, i) => (
                              <div key={i} className="text-xs text-text-muted leading-snug">
                                {a.addon_name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleAction(res.reservation_id, "Approved")}
                            className="rounded-lg bg-topbar px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:opacity-75 disabled:opacity-30"
                          >
                            {loading ? "·····" : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleAction(res.reservation_id, "Rejected")}
                            className="rounded-lg bg-accent-red px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:opacity-75 disabled:opacity-30"
                          >
                            {loading ? "·····" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer count */}
        {filtered.length > 0 && (
          <div className="border-t border-border px-6 py-3">
            <span className="text-xs text-text-muted">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
              {search ? ` matching "${search}"` : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Add Reservation Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10 backdrop-blur-[2px]">
          <div className="relative w-full max-w-2xl rounded-3xl bg-card-light shadow-[0_32px_80px_rgba(0,0,0,0.3)]">

            {/* Modal header */}
            <div className="flex items-center justify-between rounded-t-3xl bg-topbar px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                  New Entry
                </div>
                <div className="mt-0.5 text-lg font-semibold text-white">
                  Add Reservation
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-7">

                {/* Guest & Order */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Guest & Order
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Guest</FieldLabel>
                      <select
                        required
                        value={form.guest_id}
                        onChange={(e) => setField("guest_id", e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select a guest...</option>
                        {guests.map((g) => (
                          <option key={g.guest_id} value={g.guest_id}>
                            {g.first_name} {g.last_name} · {g.guest_type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <FieldLabel>Order ID</FieldLabel>
                        <span className="rounded-full bg-accent-green/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-accent-green">
                          Auto
                        </span>
                      </div>
                      <div className="flex h-10 w-full items-center rounded-xl border border-border bg-shell/50 px-3 font-mono text-sm text-text-muted">
                        Auto-assigned on save
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Dates */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Dates
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Check-in Date</FieldLabel>
                      <input
                        required
                        type="date"
                        min={today}
                        value={form.check_in_date}
                        onChange={(e) => {
                          const val = e.target.value;
                          setField("check_in_date", val);
                          if (form.check_out_date && form.check_out_date <= val) {
                            setField("check_out_date", "");
                          }
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Check-in Time</FieldLabel>
                      <input
                        required
                        type="time"
                        value={form.check_in_time}
                        onChange={(e) => setField("check_in_time", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Check-out Date</FieldLabel>
                      <input
                        required
                        type="date"
                        min={form.check_in_date ? form.check_in_date : today}
                        value={form.check_out_date}
                        onChange={(e) => setField("check_out_date", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Check-out Time</FieldLabel>
                      <input
                        required
                        type="time"
                        value={form.check_out_time}
                        onChange={(e) => setField("check_out_time", e.target.value)}
                        className={inputClass}
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
                      <FieldLabel>Adults</FieldLabel>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.adult_count}
                        onChange={(e) => setField("adult_count", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Children</FieldLabel>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.children_count}
                        onChange={(e) => setField("children_count", e.target.value)}
                        className={inputClass}
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

                  {selectedVenues.length === 0 ? (
                    <p className="text-xs text-text-muted">
                      No venues added yet. Click &quot;Add venue&quot; to begin.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedVenues.map((row, i) => {
                        const venueInfo = venues.find((v) => v.venue_id === row.venue_id);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            {/* Venue dropdown */}
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
                                      disabled={
                                        usedVenueIds.has(v.venue_id) &&
                                        v.venue_id !== row.venue_id
                                      }
                                    >
                                      {v.venue_name}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>

                            {/* Price display */}
                            <div className="flex h-10 w-36 shrink-0 items-center justify-end rounded-xl border border-border bg-shell/50 px-3 text-sm font-semibold tabular-nums text-text-on-light">
                              {row.venue_id > 0 ? PHP(row.price_snapshot) : "₱ —"}
                            </div>

                            {/* Remove */}
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

                  {/* Total price summary */}
                  {selectedVenues.length > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-shell/60 px-4 py-3">
                      <div className="text-xs font-medium text-text-muted">
                        Total · {selectedVenues.filter((v) => v.venue_id > 0).length}{" "}
                        {selectedVenues.filter((v) => v.venue_id > 0).length === 1
                          ? "venue"
                          : "venues"}
                      </div>
                      <div className="text-base font-bold tabular-nums text-text-on-light">
                        {PHP(totalPrice)}
                      </div>
                    </div>
                  )}
                </fieldset>

                {/* Financial */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Financial
                  </legend>
                  <div>
                    <FieldLabel>Payment Status</FieldLabel>
                    <select
                      value={form.payment_status}
                      onChange={(e) => setField("payment_status", e.target.value)}
                      className={selectClass}
                    >
                      <option>Pending</option>
                      <option>Partially Paid</option>
                      <option>Fully Paid</option>
                    </select>
                  </div>
                </fieldset>

                {/* Administrative */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Administrative
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Approval Status</FieldLabel>
                      <select
                        value={form.approval_status}
                        onChange={(e) => setField("approval_status", e.target.value)}
                        className={selectClass}
                      >
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Booking Source</FieldLabel>
                      <select
                        value={form.booking_source}
                        onChange={(e) => setField("booking_source", e.target.value)}
                        className={selectClass}
                      >
                        <option>Website</option>
                        <option>Social Media</option>
                        <option>OTA</option>
                        <option>OTC</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <FieldLabel>Special Notes</FieldLabel>
                    <textarea
                      value={form.special_notes}
                      onChange={(e) => setField("special_notes", e.target.value)}
                      rows={3}
                      placeholder="Any special requests or notes..."
                      className="w-full resize-none rounded-xl border border-border bg-shell px-3 py-2.5 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                    />
                  </div>
                </fieldset>

                {/* Add-ons */}
                <fieldset>
                  <div className="mb-3 flex items-center justify-between">
                    <legend className="text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                      Add-ons
                    </legend>
                    <button
                      type="button"
                      onClick={addAddon}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light"
                    >
                      <PlusLg size={9} />
                      Add item
                    </button>
                  </div>
                  {addons.length === 0 ? (
                    <p className="text-xs text-text-muted">
                      No add-ons yet. Click &quot;Add item&quot; to attach one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {addons.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add-on name"
                            value={a.addon_name}
                            onChange={(e) => updateAddon(i, "addon_name", e.target.value)}
                            className="h-9 flex-1 rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                          />
                          <input
                            type="text"
                            placeholder="Category"
                            value={a.addon_category}
                            onChange={(e) => updateAddon(i, "addon_category", e.target.value)}
                            className="h-9 w-32 rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => removeAddon(i)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-accent-red hover:text-accent-red"
                            aria-label="Remove add-on"
                          >
                            <Trash3 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>

                {/* Error */}
                {formError && (
                  <div className="rounded-xl bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
                    {formError}
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex justify-end gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-topbar px-6 py-2.5 text-sm font-semibold text-text-on-dark transition hover:opacity-75 disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Reservation"}
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
