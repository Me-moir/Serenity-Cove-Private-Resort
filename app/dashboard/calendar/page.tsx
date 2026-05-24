"use client";

import { useEffect, useRef, useState } from "react";
import CalendarView from "@/components/dashboard/CalendarView";
import IntelligenecePanel from "@/components/dashboard/ReportsPanel";
import { formatDateLabel, toDateKey } from "@/lib/date";

const MIN_LEFT_WIDTH = 40;
const MAX_LEFT_WIDTH = 70;
const DEFAULT_LEFT_WIDTH = 62;

export default function CalendarPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [showSliderTip, setShowSliderTip] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(MAX_LEFT_WIDTH, Math.max(MIN_LEFT_WIDTH, nextWidth));
      setLeftWidth(clamped);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!showSliderTip) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSliderTip(false);
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showSliderTip]);

  return (
    <div className="space-y-6">
      <div className="lg:hidden">
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      <div
        ref={containerRef}
        className={`hidden gap-6 lg:grid ${isDragging ? "select-none" : ""}`}
        style={{ gridTemplateColumns: `${leftWidth}% 24px minmax(0, 1fr)` }}
      >
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className="relative flex h-full items-center justify-center">
          <button
            type="button"
            onMouseDown={() => {
              setIsDragging(true);
              setShowSliderTip(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                setLeftWidth((prev) => Math.max(MIN_LEFT_WIDTH, prev - 2));
                setShowSliderTip(false);
              }
              if (event.key === "ArrowRight") {
                setLeftWidth((prev) => Math.min(MAX_LEFT_WIDTH, prev + 2));
                setShowSliderTip(false);
              }
            }}
            className="group relative flex h-full w-full cursor-col-resize items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-shell"
            role="separator"
            aria-label="Resize calendar and reports"
            aria-orientation="vertical"
            aria-valuemin={MIN_LEFT_WIDTH}
            aria-valuemax={MAX_LEFT_WIDTH}
            aria-valuenow={Math.round(leftWidth)}
            title="Drag to resize"
          >
            <span
              className={`h-[96%] w-[4px] rounded-full border transition ${
                isDragging
                  ? "border-accent-blue bg-accent-blue shadow-[0_0_0_4px_rgba(49,130,206,0.22)]"
                  : "border-[var(--color-slider-line)] bg-[var(--color-slider-line)] group-hover:border-accent-blue/80 group-hover:bg-accent-blue/80"
              }`}
            />
          </button>

          {showSliderTip ? (
            <div className="absolute left-full top-6 z-20 ml-3 flex items-center gap-2 rounded-full border border-border bg-card-light px-3 py-1.5 text-xs font-medium text-text-on-light shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
              <span className="whitespace-nowrap">Slide to adjust</span>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={() => setShowSliderTip(false)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] leading-none text-text-muted transition hover:border-text-muted hover:text-text-on-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                aria-label="Close slider tip"
                title="Close tip"
              >
                x
              </button>
              <span className="pointer-events-none absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-border bg-card-light" />
            </div>
          ) : null}
        </div>
        <IntelligenecePanel selectedDate={selectedDate} />
      </div>

      <div className="lg:hidden">
        <details className="overflow-hidden rounded-3xl border border-white/10 bg-card-dark text-text-on-dark">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold tracking-[0.2em] text-text-on-dark">
            REPORTS · {formatDateLabel(selectedDate).toUpperCase()}
          </summary>
          <div className="px-2 pb-2">
            <IntelligenecePanel selectedDate={selectedDate} />
          </div>
        </details>
      </div>
    </div>
  );
}
