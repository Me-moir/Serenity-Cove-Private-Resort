"use client";

import { useState, useMemo } from "react";
import {
  StarFill,
  Star,
  HandThumbsUpFill,
  ChatLeftTextFill,
  ArrowUpShort,
  ArrowDownShort,
  DashLg,
  PeopleFill,
} from "react-bootstrap-icons";
import type { ReviewWithGuest } from "@/types/database";

const GUEST_TYPE_CLS: Record<string, string> = {
  New:       "bg-accent-blue/15 text-accent-blue",
  Returning: "bg-accent-green/15 text-accent-green",
  VIP:       "bg-accent-orange/15 text-accent-orange",
};

const GUEST_TYPE_ACTIVE: Record<string, string> = {
  New:       "border-accent-blue/40 bg-accent-blue/15 text-accent-blue",
  Returning: "border-accent-green/40 bg-accent-green/15 text-accent-green",
  VIP:       "border-accent-orange/40 bg-accent-orange/15 text-accent-orange",
};

const GUEST_TYPE_BAR: Record<string, string> = {
  New:       "bg-accent-blue",
  Returning: "bg-accent-green",
  VIP:       "bg-accent-orange",
};

const AVATAR_PALETTES = [
  "bg-accent-blue/15 text-accent-blue",
  "bg-accent-green/15 text-accent-green",
  "bg-accent-orange/15 text-accent-orange",
];

function StarRowLight({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? (
          <StarFill key={i} size={size} className="text-accent-orange" />
        ) : (
          <Star key={i} size={size} className="text-text-muted/25" />
        )
      )}
    </div>
  );
}

function TrendIcon({ delta }: { delta: number }) {
  if (delta > 0.1)  return <ArrowUpShort   size={14} className="shrink-0 text-accent-green" />;
  if (delta < -0.1) return <ArrowDownShort size={14} className="shrink-0 text-accent-red" />;
  return <DashLg size={10} className="shrink-0 text-text-muted" />;
}

const PER_PAGE = 5;
const MONTHS_BACK = 6;

export default function CustomerFeedbackView({ reviews }: { reviews: ReviewWithGuest[] }) {
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const now = new Date();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const thisMonth = reviews.filter((r) => {
    const d = new Date(r.review_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthAvg =
    thisMonth.length > 0
      ? thisMonth.reduce((s, r) => s + r.rating, 0) / thisMonth.length
      : avgRating;

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
        : 0,
  }));

  // Monthly trend — last MONTHS_BACK calendar months
  const monthlyTrend = useMemo(() =>
    Array.from({ length: MONTHS_BACK }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1);
      const bucket = reviews.filter((r) => {
        const rd = new Date(r.review_date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      });
      return {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        avg: bucket.length > 0 ? bucket.reduce((s, r) => s + r.rating, 0) / bucket.length : 0,
        count: bucket.length,
      };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [reviews]);

  // Guest type breakdown
  const guestTypeSplit = useMemo(() =>
    (["New", "Returning", "VIP"] as const).map((type) => {
      const count = reviews.filter((r) => r.guests?.guest_type === type).length;
      return {
        type,
        count,
        pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
      };
    }),
  [reviews]);

  const filtered = useMemo(
    () =>
      reviews.filter((r) => {
        if (starFilter !== null && r.rating !== starFilter) return false;
        if (typeFilter !== null && r.guests?.guest_type !== typeFilter) return false;
        return true;
      }),
    [reviews, starFilter, typeFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111114]">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h1 className="text-lg font-bold text-white">Customer Feedback</h1>
            <p className="mt-0.5 text-xs text-white/40">
              Grand Mansion Venue · Guest satisfaction overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-accent-orange/30 bg-accent-orange/10 px-3 py-1">
              <StarFill size={10} className="text-accent-orange" />
              <span className="text-[11px] font-semibold text-accent-orange">
                {avgRating.toFixed(1)} avg
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              <span className="text-[11px] font-semibold text-accent-green">
                {reviews.length} reviews
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.06]">
          {[
            { value: reviews.length,         label: "Total Reviews" },
            { value: thisMonth.length,        label: "This Month" },
            { value: avgRating.toFixed(1),    label: "Avg Rating" },
            { value: fiveStarCount,           label: "5-Star Reviews" },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-3 ${i !== 1 && i !== 3 ? "border-r border-white/[0.06]" : ""} ${i === 1 ? "sm:border-r sm:border-white/[0.06]" : ""} ${i >= 2 ? "border-t border-white/[0.06] sm:border-t-0" : ""}`}
            >
              <div className="text-xl font-extrabold tabular-nums text-white">{value}</div>
              <div className="text-[10px] text-white/30">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4">

        {/* Left — Analytics ─────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-[5] space-y-4">

          {/* Rating Summary */}
          <div className="rounded-3xl border border-white/[0.06] bg-[#111114] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-[3px] rounded-full bg-accent-orange/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Rating Summary
              </span>
            </div>
            <div className="flex items-center gap-6">

              {/* Overall avg */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-orange/15">
                  <StarFill size={26} className="text-accent-orange" />
                </div>
                <div className="text-2xl font-extrabold leading-none text-white">
                  {avgRating.toFixed(1)}
                </div>
                <div className="text-[10px] text-white/30">overall</div>
              </div>

              {/* Distribution bars */}
              <div className="flex-1 space-y-1.5">
                {dist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-right text-[10px] tabular-nums text-white/40">
                      {star}
                    </span>
                    <StarFill size={7} className="shrink-0 text-accent-orange" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-accent-orange transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-5 text-right text-[10px] tabular-nums text-white/30">
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* This month */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-green/15">
                  <HandThumbsUpFill size={22} className="text-accent-green" />
                </div>
                <div className="text-2xl font-extrabold leading-none text-white">
                  {monthAvg.toFixed(1)}
                </div>
                <div className="text-[10px] text-white/30">this month</div>
              </div>

            </div>
          </div>

          {/* Monthly Rating Trend */}
          <div className="rounded-3xl border border-white/[0.06] bg-[#111114] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-[3px] rounded-full bg-accent-blue/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Rating Trend · Last {MONTHS_BACK} Months
              </span>
            </div>
            {reviews.length === 0 ? (
              <p className="text-xs text-white/30">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {monthlyTrend.map(({ label, avg, count }, i) => {
                  const prev = monthlyTrend[i - 1]?.avg ?? avg;
                  const delta = avg - prev;
                  const pct = Math.round((avg / 5) * 100);
                  return (
                    <div key={label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-white/70">{label}</span>
                          {count > 0 && (
                            <span className="text-[10px] text-white/25">({count})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {count > 0 && i > 0 && <TrendIcon delta={delta} />}
                          <span className="text-xs font-bold tabular-nums text-white/50">
                            {count > 0 ? avg.toFixed(1) : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            avg >= 4.5
                              ? "bg-accent-green"
                              : avg >= 3.5
                              ? "bg-accent-blue"
                              : avg >= 2
                              ? "bg-accent-orange"
                              : count === 0
                              ? "bg-transparent"
                              : "bg-accent-red"
                          }`}
                          style={{ width: count > 0 ? `${pct}%` : "0%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guest Type Breakdown */}
          <div className="rounded-3xl border border-white/[0.06] bg-[#111114] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-[3px] rounded-full bg-accent-green/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Reviewers by Guest Type
              </span>
            </div>
            {reviews.length === 0 ? (
              <p className="text-xs text-white/30">No data yet.</p>
            ) : (
              <div className="space-y-4">
                {guestTypeSplit.map(({ type, count, pct }) => (
                  <div key={type}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PeopleFill size={10} className={GUEST_TYPE_CLS[type]?.split(" ")[1]} />
                        <span className="text-xs font-medium text-white/70">{type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] tabular-nums text-white/30">{count}</span>
                        <span className="text-xs font-bold tabular-nums text-white/50">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${GUEST_TYPE_BAR[type]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right — Reviews Feed ─────────────────────────────────────────────── */}
        <div className="flex-[4] min-w-0 flex flex-col">
          <div className="flex flex-col flex-1 overflow-hidden rounded-3xl border border-border bg-card-light shadow-md">

            {/* Filter header */}
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-bold text-text-on-light">Reviews</h2>

              {/* Star filter pills */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { setStarFilter(starFilter === star ? null : star); setPage(0); }}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      starFilter === star
                        ? "border-accent-orange/40 bg-accent-orange/15 text-accent-orange"
                        : "border-border text-text-muted hover:border-accent-orange/30 hover:bg-accent-orange/5 hover:text-accent-orange"
                    }`}
                  >
                    {star}
                    <StarFill size={8} />
                  </button>
                ))}
                <div className="mx-0.5 h-4 w-px self-center bg-border" />
                {(["New", "Returning", "VIP"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setTypeFilter(typeFilter === type ? null : type); setPage(0); }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      typeFilter === type
                        ? GUEST_TYPE_ACTIVE[type]
                        : "border-border text-text-muted hover:border-border hover:bg-shell/60"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-[10px] text-text-muted">
                {filtered.length} {filtered.length === 1 ? "review" : "reviews"}
                {(starFilter !== null || typeFilter !== null) ? " — filtered" : ""}
              </div>
            </div>

            {/* Review cards — scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-14">
                  <ChatLeftTextFill size={22} className="text-text-muted/20" />
                  <div className="mt-3 text-sm font-semibold text-text-on-light">
                    {reviews.length === 0 ? "No reviews yet" : "No reviews match"}
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    {reviews.length === 0
                      ? "Reviews submitted by guests will appear here"
                      : "Try clearing the active filters"}
                  </div>
                </div>
              ) : (
                paginated.map((r, idx) => {
                  const name = r.guests
                    ? `${r.guests.first_name} ${r.guests.last_name}`
                    : "Unknown Guest";
                  const guestType = r.guests?.guest_type ?? null;
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <article key={r.review_id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                              AVATAR_PALETTES[idx % AVATAR_PALETTES.length]
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-text-on-light">
                                {name}
                              </span>
                              {guestType && (
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${GUEST_TYPE_CLS[guestType]}`}
                                >
                                  {guestType}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5">
                              <StarRowLight rating={r.rating} size={10} />
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-[10px] text-text-muted">
                          {new Date(r.review_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      {r.review_text && (
                        <p className="mt-2.5 pl-12 text-xs leading-relaxed text-text-muted">
                          &ldquo;{r.review_text}&rdquo;
                        </p>
                      )}
                    </article>
                  );
                })
              )}
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex-none flex items-center justify-between border-t border-border px-5 py-3">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-text-muted transition-all hover:border-accent-blue/40 hover:bg-accent-blue/5 hover:text-accent-blue disabled:pointer-events-none disabled:opacity-30"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        i === safePage
                          ? "w-4 bg-accent-blue"
                          : "w-1.5 bg-border hover:bg-text-muted/40"
                      }`}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-text-muted transition-all hover:border-accent-blue/40 hover:bg-accent-blue/5 hover:text-accent-blue disabled:pointer-events-none disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
