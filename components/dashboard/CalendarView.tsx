"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import type { CalendarDay } from "@/types";

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const dotClasses: Record<string, string> = {
  orange: "bg-accent-orange",
  red: "bg-accent-red",
  green: "bg-accent-green",
  blue: "bg-accent-blue"
};

export default function CalendarView() {
  const [monthIndex, setMonthIndex] = useState(0);
  const monthLabels = ["MAY 2026", "JUN 2026"];

  const startOffset = 5;
  const daysInMonth = 31;
  const cells: CalendarDay[] = [
    ...Array.from({ length: startOffset }, () => ({ day: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      dots: getDots(index + 1),
      isToday: index + 1 === 26
    }))
  ];

  while (cells.length % 7 !== 0) {
    cells.push({ day: null });
  }

  return (
    <div className="rounded-3xl bg-card-dark p-6 text-text-on-dark">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.4em] text-text-on-dark/70">
          {monthLabels[monthIndex]}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthIndex((prev) => (prev === 0 ? 1 : 0))}
            className="rounded-full border border-white/10 p-2"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMonthIndex((prev) => (prev === 0 ? 1 : 0))}
            className="rounded-full border border-white/10 p-2"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-[11px] text-text-on-dark/70">
        {weekDays.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {cells.map((cell, index) => (
          <div key={`${cell.day ?? "empty"}-${index}`}>
            {cell.day ? (
              <div
                className={`flex h-12 flex-col items-center justify-center rounded-2xl text-sm sm:h-14 ${
                  cell.isToday
                    ? "bg-white text-text-on-light"
                    : "bg-white/5 text-text-on-dark"
                }`}
              >
                <div className="font-semibold">{cell.day}</div>
                {cell.isToday ? (
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-on-light">
                    Today
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="h-12 sm:h-14" />
            )}

            {cell.day && cell.dots && cell.dots.length > 0 ? (
              <div className="mt-1 flex items-center justify-center gap-1">
                {cell.dots.map((dot, dotIndex) => (
                  <span
                    key={`${cell.day}-${dot}-${dotIndex}`}
                    className={`h-1.5 w-1.5 rounded-full ${dotClasses[dot]}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-text-on-dark/70">
        <LegendDot color="orange" label="Flags Reported" />
        <LegendDot color="red" label="Unresolved Incidence" />
        <LegendDot color="green" label="Need Attention" />
        <LegendDot color="blue" label="Important" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dotClasses[color]}`} />
      <span>{label}</span>
    </div>
  );
}

function getDots(day: number) {
  const dots: Array<"orange" | "red" | "green" | "blue"> = [];

  if ([3, 12, 21].includes(day)) {
    dots.push("orange");
  }
  if ([6, 16, 26].includes(day)) {
    dots.push("red");
  }
  if ([9, 18].includes(day)) {
    dots.push("green");
  }
  if ([11, 24, 29].includes(day)) {
    dots.push("blue");
  }

  return dots;
}
