"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
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
  guests: { guest_name: string; guest_type: string } | null;
  reservation_addons: Addon[];
}

interface GuestOption {
  guest_id: number;
  guest_name: string;
  guest_type: string;
}

interface Props {
  reservations: Reservation[];
  guests: GuestOption[];
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
  order_id: "",
  guest_id: "",
  check_in_date: "",
  check_in_time: "14:00",
  check_out_date: "",
  check_out_time: "12:00",
  adult_count: "1",
  children_count: "0",
  total_price: "",
  payment_status: "Pending",
  approval_status: "Pending",
  booking_source: "Website",
  special_notes: "",
};

/* ─── Main component ─────────────────────────────────────────────────── */

export default function ReservationApproval({ reservations, guests }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [addons, setAddons] = useState<{ addon_name: string; addon_category: string }[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Stat counts */
  const pendingCount = reservations.filter((r) => r.approval_status === "Pending").length;
  const fullyPaidCount = reservations.filter((r) => r.payment_status === "Fully Paid").length;
  const partialCount = reservations.filter((r) => r.payment_status === "Partially Paid").length;

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reservations;
    return reservations.filter(
      (r) =>
        r.guests?.guest_name.toLowerCase().includes(q) ||
        r.order_id.toLowerCase().includes(q) ||
        r.guests?.guest_type.toLowerCase().includes(q) ||
        r.payment_status.toLowerCase().includes(q) ||
        r.approval_status.toLowerCase().includes(q) ||
        r.reservation_addons.some((a) => a.addon_name.toLowerCase().includes(q)),
    );
  }, [reservations, search]);

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

  /* Add-ons */
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

    if (!form.guest_id) return setFormError("Please select a guest.");
    if (!form.order_id.trim()) return setFormError("Order ID is required.");
    if (!form.check_in_date || !form.check_out_date)
      return setFormError("Check-in and check-out dates are required.");
    if (!form.total_price) return setFormError("Total price is required.");

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
          order_id: form.order_id.trim(),
          guest_id: Number(form.guest_id),
          check_in_date: form.check_in_date,
          check_in_time: form.check_in_time,
          check_out_date: form.check_out_date,
          check_out_time: form.check_out_time,
          adult_count: Number(form.adult_count),
          children_count: Number(form.children_count),
          total_price: Number(form.total_price),
          payment_status: form.payment_status,
          approval_status: form.approval_status,
          booking_source: form.booking_source,
          special_notes: form.special_notes.trim() || null,
        },
        validAddons,
      );
      setForm(BLANK_FORM);
      setAddons([]);
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
          label="Pending Reservations"
          from="#D4860A"
          to="#A86300"
        />
        <StatCard
          icon={<CheckCircleFill size={22} />}
          count={fullyPaidCount}
          label="Fully Paid Reservations"
          from="#2E5A28"
          to="#1C3A18"
        />
        <StatCard
          icon={<HourglassSplit size={22} />}
          count={partialCount}
          label="Partially Paid Reservations"
          from="#2C2C2C"
          to="#141414"
        />
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">

        {/* Search + Add */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={13}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reservation..."
              className="h-9 w-full rounded-xl border border-border bg-shell pl-8 pr-4 text-sm text-text-on-light placeholder:text-text-muted focus:border-[#9a9a9a] focus:outline-none transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
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
                  "Total Price",
                  "Status",
                  "Requests",
                  "Actions",
                ].map((h, i) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center text-sm text-text-muted">
                    {search
                      ? "No reservations match your search."
                      : "No reservations found."}
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
                          {res.guests?.guest_name ?? "—"}
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
                        <div
                          className={`mt-0.5 text-[10px] uppercase tracking-[0.15em] ${approvalColor[res.approval_status] ?? "text-text-muted"}`}
                        >
                          {res.approval_status}
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
                            disabled={loading || res.approval_status === "Approved"}
                            onClick={() => handleAction(res.reservation_id, "Approved")}
                            className="rounded-lg bg-topbar px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:opacity-75 disabled:opacity-30"
                          >
                            {loading ? "·····" : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={loading || res.approval_status === "Rejected"}
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
                            {g.guest_name} · {g.guest_type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Order ID</FieldLabel>
                      <input
                        required
                        type="text"
                        value={form.order_id}
                        onChange={(e) => setField("order_id", e.target.value)}
                        placeholder="e.g. RSV-0201"
                        className={inputClass}
                      />
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
                        value={form.check_in_date}
                        onChange={(e) => setField("check_in_date", e.target.value)}
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

                {/* Financial */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Financial
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Total Price (₱)</FieldLabel>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.total_price}
                        onChange={(e) => setField("total_price", e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </div>
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
                      No add-ons yet. Click "Add item" to attach one.
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
