"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { parseDateKey, toDateKey } from "@/lib/date";
import { getIntelligenceDotColorsForDate } from "@/lib/intelligence";
import type { AccentColor, CalendarDay } from "@/types";

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const dotClasses: Record<AccentColor, string> = {
  orange: "bg-accent-orange",
  red: "bg-accent-red",
  green: "bg-accent-green",
  blue: "bg-accent-blue"
};

interface CalendarViewProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}

export default function CalendarView({ selectedDate, onSelectDate }: CalendarViewProps) {
  const today = new Date();
  const selectedDateValue = parseDateKey(selectedDate);
  const [monthIndex, setMonthIndex] = useState(() =>
    getMonthOffset(today, selectedDateValue)
  );
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthIndex, 1);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  })
    .format(viewDate)
    .toUpperCase();
  const startOffset = viewDate.getDay();
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const isViewingCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();
  const cells: CalendarDay[] = [
    ...Array.from({ length: startOffset }, () => ({ day: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNumber);
      const cellDateKey = toDateKey(cellDate);

      return {
        day: dayNumber,
        dots: getIntelligenceDotColorsForDate(cellDateKey),
        isToday: isViewingCurrentMonth && dayNumber === today.getDate(),
        dateKey: cellDateKey
      };
    })
  ];

  while (cells.length % 7 !== 0) {
    cells.push({ day: null });
  }

  return (
    <div className="rounded-3xl bg-card-dark p-4 text-text-on-dark sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.25em] text-text-on-dark/70 sm:text-xs sm:tracking-[0.4em]">
          {monthLabel}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthIndex((prev) => prev - 1)}
            className="rounded-full border border-white/10 p-2"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMonthIndex((prev) => prev + 1)}
            className="rounded-full border border-white/10 p-2"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5 text-[10px] text-text-on-dark/70 sm:gap-2 sm:text-[11px]">
        {weekDays.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((cell, index) => (
          <div key={`${cell.day ?? "empty"}-${index}`}>
            {cell.day ? (
              <button
                type="button"
                onClick={() => {
                  if (cell.dateKey) {
                    onSelectDate(cell.dateKey);
                  }
                }}
                className={`flex h-12 w-full flex-col items-center justify-center rounded-2xl px-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue sm:h-16 sm:text-sm ${
                  cell.dateKey === selectedDate
                    ? "bg-accent-blue text-white shadow-[0_8px_20px_rgba(96,165,250,0.35)]"
                    : cell.isToday
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/5 text-text-on-dark hover:bg-white/15"
                }`}
                aria-pressed={cell.dateKey === selectedDate}
                aria-label={`View report for ${monthLabel} ${cell.day}`}
              >
                <div className="font-semibold leading-none">{cell.day}</div>
                <div className="mt-1 flex min-h-[0.5rem] items-center justify-center gap-1">
                  {cell.dots?.map((dot, dotIndex) => (
                    <span
                      key={`${cell.day}-${dot}-${dotIndex}`}
                      className={`h-1.5 w-1.5 rounded-full ${dotClasses[dot]} ${
                        cell.dateKey === selectedDate ? "opacity-90" : ""
                      }`}
                    />
                  ))}
                </div>
              </button>
            ) : (
              <div className="flex h-12 items-center justify-center rounded-2xl bg-transparent sm:h-16">
                <span className="sr-only">Empty</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-text-on-dark/75 sm:text-xs">
        Select a date tile to update the Daily Snapshot on the right.
      </div>

      <div className="mt-6 grid gap-2 text-[11px] text-text-on-dark/70 sm:flex sm:flex-wrap sm:gap-4 sm:text-xs">
        <LegendDot color="orange" label="Flags Reported" />
        <LegendDot color="red" label="Unresolved Incidence" />
        <LegendDot color="green" label="Need Attention" />
        <LegendDot color="blue" label="Important" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: AccentColor; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dotClasses[color]}`} />
      <span>{label}</span>
    </div>
  );
}

function getMonthOffset(baseDate: Date, targetDate: Date) {
  return (
    (targetDate.getFullYear() - baseDate.getFullYear()) * 12 +
    (targetDate.getMonth() - baseDate.getMonth())
  );
}
