import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  PeopleFill,
  PersonPlusFill,
  ArrowRepeat,
  StarFill,
  CalendarCheckFill,
  ClockHistory,
} from "react-bootstrap-icons";

export const dynamic = "force-dynamic";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card-light p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent ?? "bg-shell text-text-muted"}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</div>
        {sub && <div className="mt-0.5 text-[10px] text-text-muted">{sub}</div>}
      </div>
    </div>
  );
}

export default async function GuestsPage() {
  const sb = createSupabaseServiceClient();

  const { data: guests } = await sb
    .from("guests")
    .select("*, reservations(check_in_date, check_out_date, adult_count, children_count, order_id)")
    .order("created_at", { ascending: false });

  const all = guests ?? [];
  const today = new Date().toISOString().split("T")[0];

  const total = all.length;
  const newCount = all.filter((g) => g.guest_type === "New").length;
  const returningCount = all.filter((g) => g.guest_type === "Returning").length;
  const vipCount = all.filter((g) => g.guest_type === "VIP").length;

  type Res = { check_in_date: string; check_out_date: string; adult_count: number; children_count: number; order_id: string };

  const ongoingGuests = all.filter((g) =>
    (g.reservations as Res[])?.some(
      (r) => r.check_in_date <= today && r.check_out_date >= today,
    ),
  );

  const recentGuests = all.slice(0, 10);

  const typeLabel: Record<string, string> = {
    New: "bg-accent-blue/15 text-accent-blue",
    Returning: "bg-accent-green/15 text-accent-green",
    VIP: "bg-accent-orange/15 text-accent-orange",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-text-on-light">
        Guests <span className="font-light text-text-muted">Overview</span>
      </h1>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<PeopleFill size={20} />}
          label="Total Guests"
          value={total.toLocaleString()}
          accent="bg-topbar/10 text-topbar"
        />
        <StatCard
          icon={<PersonPlusFill size={20} />}
          label="New Guests"
          value={newCount.toLocaleString()}
          sub={total ? `${Math.round((newCount / total) * 100)}% of total` : undefined}
          accent="bg-accent-blue/10 text-accent-blue"
        />
        <StatCard
          icon={<ArrowRepeat size={20} />}
          label="Returning"
          value={returningCount.toLocaleString()}
          sub={total ? `${Math.round((returningCount / total) * 100)}% of total` : undefined}
          accent="bg-accent-green/10 text-accent-green"
        />
        <StatCard
          icon={<StarFill size={20} />}
          label="VIP Guests"
          value={vipCount.toLocaleString()}
          sub={total ? `${Math.round((vipCount / total) * 100)}% of total` : undefined}
          accent="bg-accent-orange/10 text-accent-orange"
        />
      </div>

      {/* ── Two columns ─────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Ongoing stays today */}
        <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <CalendarCheckFill size={14} className="text-accent-green" />
            <span className="text-sm font-semibold">Ongoing Stays Today</span>
            <span className="ml-auto rounded-full bg-accent-green/15 px-2.5 py-0.5 text-[10px] font-bold text-accent-green">
              {ongoingGuests.length}
            </span>
          </div>
          {ongoingGuests.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-text-muted">No guests currently checked in.</div>
          ) : (
            <ul className="divide-y divide-border">
              {ongoingGuests.map((g) => {
                const res = (g.reservations as Res[]).find(
                  (r) => r.check_in_date <= today && r.check_out_date >= today,
                )!;
                const pax = res.adult_count + res.children_count;
                return (
                  <li key={g.guest_id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {g.first_name} {g.last_name}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        #{res.order_id} · {pax} pax · out {res.check_out_date}
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${typeLabel[g.guest_type] ?? "bg-black/10 text-text-muted"}`}>
                      {g.guest_type}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recently added guests */}
        <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <ClockHistory size={14} className="text-text-muted" />
            <span className="text-sm font-semibold">Recently Added</span>
          </div>
          {recentGuests.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-text-muted">No guests yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {recentGuests.map((g) => {
                const bookings = (g.reservations as Res[])?.length ?? 0;
                const joined = new Date(g.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <li key={g.guest_id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {g.first_name} {g.last_name}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Joined {joined} · {bookings} booking{bookings !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${typeLabel[g.guest_type] ?? "bg-black/10 text-text-muted"}`}>
                      {g.guest_type}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Guest type breakdown bar ─────────────────────────────────── */}
      {total > 0 && (
        <div className="rounded-3xl border border-border bg-card-light p-6 shadow-sm">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">
            Guest Type Distribution
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {newCount > 0 && (
              <div
                className="bg-accent-blue transition-all"
                style={{ width: `${(newCount / total) * 100}%` }}
              />
            )}
            {returningCount > 0 && (
              <div
                className="bg-accent-green transition-all"
                style={{ width: `${(returningCount / total) * 100}%` }}
              />
            )}
            {vipCount > 0 && (
              <div
                className="bg-accent-orange transition-all"
                style={{ width: `${(vipCount / total) * 100}%` }}
              />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            {[
              { label: "New", count: newCount, color: "bg-accent-blue" },
              { label: "Returning", count: returningCount, color: "bg-accent-green" },
              { label: "VIP", count: vipCount, color: "bg-accent-orange" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-text-muted">
                  {item.label} <span className="font-semibold text-text-on-light">{item.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
