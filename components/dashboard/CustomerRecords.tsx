"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  EnvelopeFill,
  Funnel,
  PencilFill,
  PlusLg,
  Search,
  TelephoneFill,
  TrashFill,
  X,
} from "react-bootstrap-icons";
import { addGuest, updateGuest, deleteGuest } from "@/app/actions/guests";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface ReservationRef {
  order_id: string;
  created_at: string;
  check_in_date: string;
  check_out_date: string;
  adult_count: number;
  children_count: number;
}

interface IncidentRef {
  status: string;
  reported_at: string;
  resolved_at: string | null;
}

interface Guest {
  guest_id: number;
  first_name: string;
  last_name: string;
  guest_type: "New" | "Returning" | "VIP";
  contact_number: string | null;
  email: string | null;
  total_bookings: number;
  last_stay: string | null;
  created_at: string;
  reservations: ReservationRef[];
  incidents: IncidentRef[];
}

interface Props {
  guests: Guest[];
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

const BLANK_FORM = {
  first_name: "",
  last_name: "",
  guest_type: "New" as "New" | "Returning" | "VIP",
  contact_number: "+63",
  email: "",
  total_bookings: "0",
  last_stay: "",
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

function fmtId(id: number) {
  return `#${String(id).padStart(7, "0")}`;
}

function fullName(g: Guest) {
  return `${g.first_name} ${g.last_name}`;
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

function getIncidentBadge(incidents: IncidentRef[]) {
  if (!incidents.length) return "None";
  const latest = [...incidents].sort(
    (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime(),
  )[0];
  return latest.status;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── Badge components ───────────────────────────────────────────────── */

function IncidentBadge({ status }: { status: string }) {
  if (status === "Reported")
    return (
      <span className="inline-flex items-center rounded-full bg-topbar px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white">
        Reported
      </span>
    );
  if (status === "Pending")
    return (
      <span className="inline-flex items-center rounded-full bg-accent-orange px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white">
        Pending
      </span>
    );
  if (status === "Resolved")
    return (
      <span className="inline-flex items-center rounded-full bg-accent-green px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white">
        Resolved
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
      None
    </span>
  );
}

function ResolutionBadge({ status }: { status: string }) {
  if (status === "Resolved")
    return (
      <span className="inline-flex items-center rounded-full bg-accent-green px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white">
        Resolved
      </span>
    );
  if (status !== "None" && status !== "none" && status)
    return (
      <span className="inline-flex items-center rounded-full bg-accent-orange px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white">
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
      N/A
    </span>
  );
}

function GuestTypePill({ type }: { type: string }) {
  const map: Record<string, string> = {
    New: "bg-accent-blue/15 text-accent-blue",
    Returning: "bg-accent-green/15 text-accent-green",
    VIP: "bg-accent-orange/15 text-accent-orange",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${map[type] ?? "bg-black/10 text-text-muted"}`}>
      {type}
    </span>
  );
}

/* ─── Form helpers ───────────────────────────────────────────────────── */

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition";
const inputErrCls =
  "h-10 w-full rounded-xl border border-accent-red bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-accent-red focus:outline-none transition";
const selectCls =
  "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light focus:border-[#9a9a9a] focus:outline-none transition appearance-none";

function FL({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-text-muted">{children}</label>;
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function CustomerRecords({ guests }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /* UI state */
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  /* Modal state */
  const [showAdd, setShowAdd] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [contactGuest, setContactGuest] = useState<Guest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);

  /* Form state */
  const [form, setForm] = useState(BLANK_FORM);
  const [emailError, setEmailError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(false);

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return guests.filter((g) => {
      if (filterType !== "All" && g.guest_type !== filterType) return false;
      if (!q) return true;
      return (
        fullName(g).toLowerCase().includes(q) ||
        fmtId(g.guest_id).includes(q) ||
        g.guest_type.toLowerCase().includes(q) ||
        g.reservations.some((r) => r.order_id.toLowerCase().includes(q))
      );
    });
  }, [guests, search, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeP = Math.min(page, totalPages);
  const paginated = filtered.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);

  function goPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  /* Form helpers */
  const setF = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function openAdd() {
    setForm(BLANK_FORM);
    setFormError("");
    setEmailError(false);
    setShowAdd(true);
  }

  function openEdit(g: Guest) {
    setForm({
      first_name: g.first_name,
      last_name: g.last_name,
      guest_type: g.guest_type,
      contact_number: g.contact_number ?? "+63",
      email: g.email ?? "",
      total_bookings: String(g.total_bookings),
      last_stay: g.last_stay ?? "",
    });
    setFormError("");
    setEmailError(false);
    setEditGuest(g);
  }

  function closeModal() {
    setShowAdd(false);
    setEditGuest(null);
    setForm(BLANK_FORM);
    setFormError("");
    setEmailError(false);
  }

  function handlePhoneChange(val: string) {
    if (!val.startsWith("+63")) {
      setF("contact_number", "+63");
    } else {
      setF("contact_number", val);
    }
  }

  function handleEmailChange(val: string) {
    setF("email", val);
    if (val && !isValidEmail(val)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) return setFormError("First name is required.");
    if (!form.last_name.trim()) return setFormError("Last name is required.");
    if (form.email.trim() && !isValidEmail(form.email.trim())) {
      setEmailError(true);
      return setFormError("Please enter a valid email address.");
    }
    setSubmitting(true);
    setFormError("");

    const contactVal = form.contact_number.trim();
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      guest_type: form.guest_type,
      contact_number: contactVal === "+63" || contactVal === "" ? null : contactVal,
      email: form.email.trim() || null,
      total_bookings: Number(form.total_bookings) || 0,
      last_stay: form.last_stay || null,
    };

    try {
      if (editGuest) {
        await updateGuest(editGuest.guest_id, payload);
      } else {
        await addGuest(payload);
      }
      closeModal();
      startTransition(() => router.refresh());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGuest(deleteTarget.guest_id);
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

      {/* Page title */}
      <h1 className="text-3xl font-bold tracking-tight text-text-on-light">
        Customer <span className="font-light text-text-muted">Records</span>
      </h1>

      {/* ── Table card ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={13}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search customer..."
              className="h-9 w-full rounded-xl border border-border bg-shell pl-8 pr-4 text-sm text-text-on-light placeholder:text-text-muted focus:border-[#9a9a9a] focus:outline-none transition"
            />
          </div>

          {/* Filter By */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter((p) => !p)}
              className={`flex h-9 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                filterType !== "All"
                  ? "border-topbar bg-topbar text-white"
                  : "border-border text-text-muted hover:border-[#9a9a9a] hover:text-text-on-light"
              }`}
            >
              <Funnel size={13} />
              Filter By
              {filterType !== "All" && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px]">
                  {filterType}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-2xl border border-border bg-card-light shadow-lg">
                {["All", "New", "Returning", "VIP"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setFilterType(t); setShowFilter(false); setPage(1); }}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition ${
                      filterType === t
                        ? "bg-topbar text-white"
                        : "hover:bg-shell text-text-on-light"
                    }`}
                  >
                    {t === "All" ? "All Types" : t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add */}
          <button
            type="button"
            onClick={openAdd}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-topbar hover:bg-topbar hover:text-white"
            aria-label="Add guest"
          >
            <PlusLg size={14} />
          </button>

          {/* Pagination (right-aligned) */}
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
                <span key={`e-${i}`} className="flex h-8 w-6 items-center justify-center text-xs text-text-muted">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => goPage(n as number)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    n === safeP
                      ? "bg-topbar text-white"
                      : "border border-border text-text-muted hover:border-[#9a9a9a]"
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
                {["Guest Name","Customer ID","Guest Type","Recent Bookings","Incidents","Resolution","Actions"].map((h, i) => (
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
                    {search || filterType !== "All"
                      ? "No guests match the current filter."
                      : "No guests found."}
                  </td>
                </tr>
              ) : (
                paginated.map((guest) => {
                  const recentBookings = [...guest.reservations]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3);
                  const incStatus = getIncidentBadge(guest.incidents);
                  const isContactOpen = contactGuest?.guest_id === guest.guest_id;

                  return (
                    <tr key={guest.guest_id} className="transition-colors hover:bg-shell/60">
                      {/* Guest Name */}
                      <td className="py-4 pl-6 pr-4">
                        <span className="text-sm font-semibold">{fullName(guest)}</span>
                      </td>

                      {/* Customer ID */}
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-shell px-2.5 py-1 font-mono text-[11px] text-text-muted">
                          {fmtId(guest.guest_id)}
                        </span>
                      </td>

                      {/* Guest Type */}
                      <td className="px-4 py-4">
                        <GuestTypePill type={guest.guest_type} />
                      </td>

                      {/* Recent Bookings */}
                      <td className="px-4 py-4">
                        {recentBookings.length > 0 ? (
                          <div className="space-y-0.5">
                            {recentBookings.map((r) => (
                              <div key={r.order_id} className="font-mono text-[11px] text-text-muted">
                                #{r.order_id}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Incidents */}
                      <td className="px-4 py-4">
                        <IncidentBadge status={incStatus} />
                      </td>

                      {/* Resolution */}
                      <td className="px-4 py-4">
                        <ResolutionBadge status={incStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6">
                        <div className="flex items-center gap-1">

                          {/* Contact */}
                          <div className="relative">
                            <button
                              type="button"
                              title="Contact info"
                              onClick={() => setContactGuest(isContactOpen ? null : guest)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                isContactOpen
                                  ? "border-topbar bg-topbar text-white"
                                  : "border-border text-text-muted hover:border-topbar hover:bg-topbar hover:text-white"
                              }`}
                            >
                              <TelephoneFill size={12} />
                            </button>
                            {isContactOpen && (
                              <div className="absolute bottom-full right-0 z-20 mb-2 w-56 overflow-hidden rounded-2xl border border-border bg-card-light shadow-lg">
                                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">
                                    Contact Info
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setContactGuest(null)}
                                    className="text-text-muted hover:text-text-on-light"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                <div className="space-y-2 p-4">
                                  <div className="flex items-center gap-2 text-sm">
                                    <TelephoneFill size={11} className="shrink-0 text-text-muted" />
                                    <span className={guest.contact_number ? "text-text-on-light" : "text-text-muted"}>
                                      {guest.contact_number ?? "Not on file"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <EnvelopeFill size={11} className="shrink-0 text-text-muted" />
                                    <span className={`break-all ${guest.email ? "text-text-on-light" : "text-text-muted"}`}>
                                      {guest.email ?? "Not on file"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Edit */}
                          <button
                            type="button"
                            title="Edit guest"
                            onClick={() => openEdit(guest)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue"
                          >
                            <PencilFill size={12} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete guest"
                            onClick={() => setDeleteTarget(guest)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-accent-red hover:bg-accent-red/10 hover:text-accent-red"
                          >
                            <TrashFill size={12} />
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

        {/* Table footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-xs text-text-muted">
            {filtered.length === 0
              ? "No results"
              : `Showing ${(safeP - 1) * PAGE_SIZE + 1}–${Math.min(safeP * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <span className="text-xs text-text-muted">
            Page {safeP} of {totalPages}
          </span>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card-light shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center gap-3 bg-accent-red/10 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-red/15 text-accent-red">
                <TrashFill size={16} />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-red/70">
                  Confirm Delete
                </div>
                <div className="mt-0.5 text-base font-semibold text-text-on-light">
                  Delete Guest Record
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-text-muted">
                You are about to permanently delete{" "}
                <span className="font-semibold text-text-on-light">
                  {fullName(deleteTarget)}
                </span>
                . This action cannot be undone.
              </p>
              <div className="mt-3 rounded-xl border border-accent-red/20 bg-accent-red/5 px-4 py-3 text-xs text-accent-red">
                All linked reservations and incidents will lose their guest reference.
              </div>
            </div>

            {/* Actions */}
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

      {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
      {(showAdd || editGuest) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10 backdrop-blur-[2px]">
          <div className="relative w-full max-w-xl rounded-3xl bg-card-light shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-3xl bg-topbar px-6 py-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  {editGuest ? "Edit Entry" : "New Entry"}
                </div>
                <div className="mt-0.5 text-lg font-semibold text-white">
                  {editGuest ? "Edit Guest" : "Add Guest"}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">

                {/* Identity */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Identity
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FL>First Name</FL>
                      <input
                        required
                        type="text"
                        value={form.first_name}
                        onChange={(e) => setF("first_name", e.target.value)}
                        placeholder="First name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Last Name</FL>
                      <input
                        required
                        type="text"
                        value={form.last_name}
                        onChange={(e) => setF("last_name", e.target.value)}
                        placeholder="Last name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FL>Guest Type</FL>
                      <select
                        value={form.guest_type}
                        onChange={(e) => setF("guest_type", e.target.value)}
                        className={selectCls}
                      >
                        <option>New</option>
                        <option>Returning</option>
                        <option>VIP</option>
                      </select>
                    </div>
                    <div>
                      <FL>Total Bookings</FL>
                      <input
                        type="number"
                        min="0"
                        value={form.total_bookings}
                        onChange={(e) => setF("total_bookings", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Contact */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Contact
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FL>Phone Number</FL>
                      <input
                        type="tel"
                        value={form.contact_number}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+63 9XX XXX XXXX"
                        className={inputCls}
                      />
                      <p className="mt-1 text-[10px] text-text-muted">
                        Must start with +63
                      </p>
                    </div>
                    <div>
                      <FL>Email Address</FL>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="email@example.com"
                        className={emailError ? inputErrCls : inputCls}
                      />
                      {emailError && (
                        <p className="mt-1 text-[10px] text-accent-red">
                          Enter a valid email address.
                        </p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* History */}
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
                    Stay History
                  </legend>
                  <div>
                    <FL>Last Stay Date</FL>
                    <input
                      type="date"
                      value={form.last_stay}
                      onChange={(e) => setF("last_stay", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </fieldset>

                {formError && (
                  <div className="rounded-xl bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
                    {formError}
                  </div>
                )}

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
                    disabled={submitting || emailError}
                    className="rounded-xl bg-topbar px-6 py-2.5 text-sm font-semibold text-text-on-dark transition hover:opacity-75 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editGuest ? "Save Changes" : "Add Guest"}
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
