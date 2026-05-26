"use client";

import { ReactNode } from "react";
import { Printer, Download } from "react-bootstrap-icons";

interface WeeklyRevenue    { week: string; gross: number }
interface OutstandingBalance { guest_name: string; order_id: string; check_in: string; check_out: string; amount: number }
interface RefundEntry      { guest_name: string; order_id: string; reason: string; amount: number }

interface Props {
  data: {
    totalRevenue: number;
    outstandingBalance: number;
    totalRefundsAndCancellations: number;
    weeklyRevenue: WeeklyRevenue[];
    outstandingBalances: OutstandingBalance[];
    refundEntries: RefundEntry[];
  };
  scopeFilter?: ReactNode;
}

const C = {
  line: "#111111",
  bar:  "#1a1a1a",
  grid: "rgba(0,0,0,0.06)",
  tick: "#a1a1aa",
};

const PHP = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);

function smooth(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function Empty() {
  return (
    <div className="flex h-44 items-center justify-center text-xs text-text-muted">
      No data for this period
    </div>
  );
}

function ChartLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
      {children}
    </p>
  );
}

function RevenueLineChart({ data }: { data: WeeklyRevenue[] }) {
  if (!data.length) return <Empty />;

  const W = 800, H = 100;
  const pad = { left: 44, bottom: 20, top: 10, right: 12 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.gross), 1);
  const ceiling = max * 1.3;

  // Nice tick values
  const mag = Math.pow(10, Math.floor(Math.log10(ceiling / 3)));
  const step = Math.ceil(ceiling / 3 / mag) * mag;
  const yTicks: number[] = [];
  for (let t = 0; t <= ceiling + step * 0.1; t += step) yTicks.push(Math.round(t));

  const pts = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * cW,
    y: pad.top + cH - (d.gross / ceiling) * cH,
    gross: d.gross,
    week: d.week,
  }));

  const linePath = smooth(pts);
  const bottom = pad.top + cH;
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1].x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`;

  const fmt = (t: number) =>
    t >= 1_000_000 ? `${(t / 1_000_000).toFixed(1)}M`
    : t >= 1_000   ? `${Math.round(t / 1_000)}K`
    : `${t}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--chart-stroke)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--chart-stroke)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => {
        const y = pad.top + cH - (t / ceiling) * cH;
        if (y < 0) return null;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={C.grid} strokeWidth={1} />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize={7.5} fill={C.tick}>
              ₱{fmt(t)}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#rev-fill)" />
      <path d={linePath} style={{ stroke: "var(--chart-stroke)" }} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} style={{ fill: "var(--chart-dot-bg)", stroke: "var(--chart-stroke)" }} strokeWidth={1.5} />
      ))}

      {pts.map((p, i) => (
        <text key={i + "x"} x={p.x} y={H - 4} textAnchor="middle" fontSize={7.5} fill={C.tick}>
          {p.week}
        </text>
      ))}
    </svg>
  );
}

export default function FinancialReportsClient({ data, scopeFilter }: Props) {
  const net = data.totalRevenue - data.outstandingBalance - data.totalRefundsAndCancellations;

  const kpis = [
    { label: "Revenue",              value: data.totalRevenue,                 cls: "text-text-on-light" },
    { label: "Outstanding Balance",  value: data.outstandingBalance,           cls: "text-amber-500" },
    { label: "Refunds & Cancellations", value: data.totalRefundsAndCancellations, cls: "text-accent-red" },
    { label: "Net",                  value: net,                               cls: net >= 0 ? "text-text-on-light" : "text-accent-red" },
  ];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-on-light">Revenue Reports</h1>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-lg text-xs text-text-muted hover:text-text-on-light hover:border-[#9a9a9a] transition">
            <Printer size={12} /> Print
          </button>
          <button type="button" className="flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-lg text-xs text-text-muted hover:text-text-on-light hover:border-[#9a9a9a] transition">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Scope filter */}
      {scopeFilter && (
        <div className="rounded-xl border border-border bg-card-light px-5 py-3">
          {scopeFilter}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, cls }) => (
          <div key={label} className="rounded-2xl border border-border bg-card-light px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted mb-1.5">
              {label}
            </p>
            <p className={`text-lg font-bold tabular-nums leading-tight ${cls}`}>
              {PHP(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-border bg-card-light px-4 pt-3 pb-2">
        <ChartLabel>Revenue Streams</ChartLabel>
        <RevenueLineChart data={data.weeklyRevenue} />
      </div>

      {/* Outstanding + Refunds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="rounded-2xl border border-border bg-card-light p-5">
          <ChartLabel>Outstanding Balances</ChartLabel>
          {data.outstandingBalances.length === 0 ? (
            <p className="text-xs text-text-muted">No outstanding balances.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {data.outstandingBalances.map((b) => (
                <div key={b.order_id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-on-light truncate">{b.guest_name}</p>
                    <p className="text-xs text-text-muted tabular-nums">{b.check_in} – {b.check_out}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-mono text-text-muted">#{b.order_id}</p>
                    <p className="text-sm font-semibold text-amber-500 tabular-nums">{PHP(b.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card-light p-5">
          <ChartLabel>Refunds & Cancellations</ChartLabel>
          {data.refundEntries.length === 0 ? (
            <p className="text-xs text-text-muted">No refunds or cancellations.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {data.refundEntries.map((r) => (
                <div key={r.order_id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-on-light truncate">{r.guest_name}</p>
                    <p className="text-xs text-text-muted">{r.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-mono text-text-muted">#{r.order_id}</p>
                    <p className="text-sm font-semibold text-accent-red tabular-nums">{PHP(r.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
