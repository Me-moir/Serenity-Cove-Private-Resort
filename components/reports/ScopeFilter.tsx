"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Scope = "WEEK" | "MONTH" | "CUSTOM";

function getDefaultDates(scope: Scope): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (scope === "WEEK") {
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - day + 1);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { from: fmt(mon), to: fmt(sun) };
  }

  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: fmt(from), to: fmt(to) };
}

interface ScopeFilterProps {
  currentFrom: string;
  currentTo: string;
}

export default function ScopeFilter({ currentFrom, currentTo }: ScopeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [scope, setScope] = useState<Scope>("MONTH");
  const [customFrom, setCustomFrom] = useState(currentFrom);
  const [customTo, setCustomTo] = useState(currentTo);

  const applyFilter = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleScope = (s: Scope) => {
    setScope(s);
    if (s !== "CUSTOM") {
      const dates = getDefaultDates(s);
      setCustomFrom(dates.from);
      setCustomTo(dates.to);
      applyFilter(dates.from, dates.to);
    }
  };

  const handleCustomApply = () => applyFilter(customFrom, customTo);

  const inputCls =
    "border border-border rounded-xl px-3 py-1.5 text-xs w-36 bg-shell text-text-on-light focus:border-[#9a9a9a] focus:outline-none transition appearance-none";

  return (
    <div
      className={`flex items-center gap-3 flex-wrap transition-opacity ${
        isPending ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <span className="text-[10px] font-bold tracking-[0.2em] text-text-on-light uppercase">
        Scope Filter:
      </span>

      {/* Pill group */}
      <div className="flex items-center border border-border rounded-xl overflow-hidden text-xs">
        {(["WEEK", "MONTH", "CUSTOM"] as Scope[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleScope(s)}
            className={`px-4 py-1.5 font-medium transition-colors ${
              scope === s
                ? "bg-topbar text-white"
                : "bg-shell text-text-on-light hover:bg-card-light"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Date range inputs */}
      <div className="flex items-center gap-2 ml-auto">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          onBlur={() => scope === "CUSTOM" && handleCustomApply()}
          className={inputCls}
        />
        <span className="text-xs text-text-muted">to</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          onBlur={() => scope === "CUSTOM" && handleCustomApply()}
          className={inputCls}
        />
        {scope === "CUSTOM" && (
          <button
            type="button"
            onClick={handleCustomApply}
            className="px-3 py-1.5 bg-topbar text-white text-xs rounded-xl transition hover:opacity-80"
          >
            Apply
          </button>
        )}
      </div>

      {isPending && (
        <span className="text-xs text-text-muted animate-pulse">Loading…</span>
      )}
    </div>
  );
}
