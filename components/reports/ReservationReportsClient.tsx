"use client";

import { ReactNode } from "react";
import { Printer, Download } from "react-bootstrap-icons";

interface Props {
  data: {
    occupancyByWeek: { week: number; rate: number }[];
    bookingFrequency: { week: number; count: number }[];
    peakDates: { ranking: number; date: string; bookings_count: number; occupancy: number }[];
    reservationSources: { source: string; count: number; percentage: number }[];
    frequentGuests: { name: string; type: string; total_bookings: number; last_stay: string }[];
  };
  scopeFilter?: ReactNode;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  line:  "#111111",
  bar:   "#1a1a1a",
  grid:  "rgba(0,0,0,0.06)",
  tick:  "#a1a1aa",
  // donut shades — black, red, yellow, gray, light gray
  seg: ["#111111", "#DC2626", "#CA8A04", "#71717a", "#d4d4d8"],
};

// ─── Catmull-Rom smooth curve ─────────────────────────────────────────────────

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

// ─── Rounded-top bar path ─────────────────────────────────────────────────────

function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  const cr = Math.min(r, h / 2, w / 2);
  if (cr <= 0) return `M${x},${y + h} L${x},${y} L${x + w},${y} L${x + w},${y + h} Z`;
  return `M${x},${y + h} L${x},${y + cr} Q${x},${y} ${x + cr},${y} L${x + w - cr},${y} Q${x + w},${y} ${x + w},${y + cr} L${x + w},${y + h} Z`;
}

// ─── Shared empty state ───────────────────────────────────────────────────────

function Empty() {
  return (
    <div className="flex h-44 items-center justify-center text-xs text-text-muted">
      No data for this period
    </div>
  );
}

// ─── Chart label ──────────────────────────────────────────────────────────────

function ChartLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
      {children}
    </p>
  );
}

// ─── Occupancy area chart ─────────────────────────────────────────────────────

function OccupancyChart({ data }: { data: { week: number; rate: number }[] }) {
  if (!data.length) return <Empty />;

  const W = 800, H = 200;
  const pad = { left: 36, bottom: 28, top: 20, right: 12 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const pts = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * cW,
    y: pad.top + cH - (d.rate / 100) * cH,
    rate: d.rate,
    week: d.week,
  }));

  const linePath = smooth(pts);
  const bottom = pad.top + cH;
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1].x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`;

  const showLabels = data.length <= 7;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="occ-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--chart-stroke)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--chart-stroke)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {[0, 25, 50, 75, 100].map((t) => {
        const y = pad.top + cH - (t / 100) * cH;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={C.grid} strokeWidth={1} />
            <text x={pad.left - 5} y={y + 3} textAnchor="end" fontSize={8} fill={C.tick}>{t}%</text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#occ-fill)" />
      {/* Line */}
      <path d={linePath} style={{ stroke: "var(--chart-stroke)" }} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + value labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} style={{ fill: "var(--chart-dot-bg)", stroke: "var(--chart-stroke)" }} strokeWidth={1.5} />
          {showLabels && (
            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize={7} fill={C.tick}>{p.rate}%</text>
          )}
        </g>
      ))}

      {/* X labels */}
      {pts.map((p, i) => (
        <text key={i + "x"} x={p.x} y={H - 5} textAnchor="middle" fontSize={8} fill={C.tick}>
          Wk {p.week}
        </text>
      ))}
    </svg>
  );
}

// ─── Frequency bar chart ──────────────────────────────────────────────────────

function FrequencyBarChart({ data }: { data: { week: number; count: number }[] }) {
  if (!data.length) return <Empty />;

  const W = 480, H = 200;
  const pad = { left: 26, bottom: 28, top: 24, right: 12 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.count), 1);
  const ceiling = Math.ceil(max * 1.4);
  const barW = Math.max(14, (cW / data.length) * 0.55);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[0, Math.round(ceiling / 2), ceiling].map((t) => {
        const y = pad.top + cH - (t / ceiling) * cH;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={C.grid} strokeWidth={1} />
            <text x={pad.left - 5} y={y + 3} textAnchor="end" fontSize={8} fill={C.tick}>{t}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const bH = Math.max(2, (d.count / ceiling) * cH);
        const x = pad.left + (i / data.length) * cW + (cW / data.length - barW) / 2;
        const y = pad.top + cH - bH;
        return (
          <g key={d.week}>
            <path d={roundedTopBar(x, y, barW, bH, 3)} style={{ fill: "var(--chart-stroke)" }} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={8} fill={C.tick}>{d.count}</text>
            <text x={x + barW / 2} y={H - 5} textAnchor="middle" fontSize={8} fill={C.tick}>Wk {d.week}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { source: string; count: number; percentage: number }[] }) {
  if (!data.length) return <Empty />;

  const cx = 70, cy = 70, RO = 58, RI = 38;
  const total = data.reduce((s, d) => s + d.count, 0);
  let angle = -90;

  const segs = data.map((d, i) => {
    const sweep = (d.percentage / 100) * 360;
    const toR = (deg: number) => (Math.PI / 180) * deg;
    const s = toR(angle), e = toR(angle + sweep);
    angle += sweep;
    const ox1 = cx + RO * Math.cos(s), oy1 = cy + RO * Math.sin(s);
    const ox2 = cx + RO * Math.cos(e), oy2 = cy + RO * Math.sin(e);
    const ix1 = cx + RI * Math.cos(e), iy1 = cy + RI * Math.sin(e);
    const ix2 = cx + RI * Math.cos(s), iy2 = cy + RI * Math.sin(s);
    const lg = sweep > 180 ? 1 : 0;
    return {
      d: `M${ox1.toFixed(1)},${oy1.toFixed(1)} A${RO},${RO} 0 ${lg},1 ${ox2.toFixed(1)},${oy2.toFixed(1)} L${ix1.toFixed(1)},${iy1.toFixed(1)} A${RI},${RI} 0 ${lg},0 ${ix2.toFixed(1)},${iy2.toFixed(1)} Z`,
      fill: C.seg[i % C.seg.length],
      source: d.source,
      pct: d.percentage,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 140 140" className="w-32 h-32">
        {segs.map((s) => (
          <path
            key={s.source}
            d={s.d}
            style={{
              fill: s.fill === C.seg[0] ? "var(--chart-stroke)" : s.fill,
              stroke: "var(--chart-dot-bg)",
            }}
            strokeWidth={2}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight="700" style={{ fill: "var(--chart-stroke)" }}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} fill={C.tick} letterSpacing="1.5">TOTAL</text>
      </svg>
      <ul className="w-full space-y-2.5">
        {segs.map((s) => (
          <li key={s.source} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-4 rounded-full shrink-0" style={{ backgroundColor: s.fill === C.seg[0] ? "var(--chart-stroke)" : s.fill }} />
              <span className="text-xs text-text-on-light">{s.source}</span>
            </div>
            <span className="text-xs tabular-nums text-text-muted">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReservationReportsClient({ data, scopeFilter }: Props) {
  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-on-light">
          Occupancy Reports
        </h1>
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

      {/* Occupancy + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card-light p-6">
          <ChartLabel>Average Occupancy Rate</ChartLabel>
          <OccupancyChart data={data.occupancyByWeek} />
        </div>
        <div className="rounded-2xl border border-border bg-card-light p-6">
          <ChartLabel>Reservation Sources</ChartLabel>
          <DonutChart data={data.reservationSources} />
        </div>
      </div>

      {/* Frequency + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card-light p-6">
          <ChartLabel>Booking Frequency</ChartLabel>
          <FrequencyBarChart data={data.bookingFrequency} />
        </div>
        <div className="lg:col-span-3 space-y-4">

          {/* Peak dates */}
          <div className="rounded-2xl border border-border bg-card-light p-6">
            <ChartLabel>Peak Reservation Dates</ChartLabel>
            {data.peakDates.length === 0 ? (
              <p className="text-xs text-text-muted">No data for this period.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Rank", "Date", "Bookings", "Occupancy"].map((h, i) => (
                      <th key={h} className={`pb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted ${i === 0 || i === 1 ? "text-left" : i === 3 ? "text-right" : "text-center"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.peakDates.map((row) => (
                    <tr key={row.ranking} className="group hover:bg-shell/40 transition-colors">
                      <td className="py-3 text-xs text-text-muted tabular-nums">{row.ranking}</td>
                      <td className="py-3 text-xs font-medium text-text-on-light">{row.date}</td>
                      <td className="py-3 text-xs text-center text-text-on-light tabular-nums">{row.bookings_count}</td>
                      <td className="py-3 text-xs text-right font-semibold text-text-on-light tabular-nums">{row.occupancy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Frequent guests */}
          <div className="rounded-2xl border border-border bg-card-light p-6">
            <ChartLabel>Most Frequent Guests</ChartLabel>
            {data.frequentGuests.length === 0 ? (
              <p className="text-xs text-text-muted">No data for this period.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Guest", "Type", "Bookings", "Last Stay"].map((h, i) => (
                      <th key={h} className={`pb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted ${i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.frequentGuests.map((g) => (
                    <tr key={g.name} className="hover:bg-shell/40 transition-colors">
                      <td className="py-3 text-xs font-medium text-text-on-light">{g.name}</td>
                      <td className="py-3 text-xs text-center text-text-muted">{g.type}</td>
                      <td className="py-3 text-xs text-center font-semibold text-text-on-light tabular-nums">{g.total_bookings}</td>
                      <td className="py-3 text-xs text-right text-text-muted tabular-nums">{g.last_stay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
