"use client";

import { ThermometerHigh } from "react-bootstrap-icons";
import { useLiveConditions } from "@/hooks/useLiveConditions";

function formatTemperature(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return Math.round(value).toString();
}

export default function WeatherBanner() {
  const { conditions, error } = useLiveConditions();
  const heading = conditions?.weatherLabel || "Loading weather";
  const summary = error
    ? "Live weather data is unavailable right now."
    : conditions?.weatherSummary || "Fetching latest weather conditions.";
  const temperature = formatTemperature(conditions?.temperatureC);
  const locationName = conditions?.locationName || "Metro Manila";

  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-card-light p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-text-muted">
          Weather · {locationName}
        </div>
        <div className="mt-2 text-2xl font-semibold">{heading}</div>
        <p className="text-sm text-text-muted">{summary}</p>
      </div>
      <div className="flex items-center gap-2 text-accent-orange">
        <ThermometerHigh size={18} />
        <span className="text-sm font-semibold">{`${temperature}°C`}</span>
      </div>
    </div>
  );
}
