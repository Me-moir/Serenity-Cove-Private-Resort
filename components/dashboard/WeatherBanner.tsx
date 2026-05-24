import { ThermometerHigh } from "react-bootstrap-icons";

export default function WeatherBanner() {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-card-light p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-text-muted">
          Weather
        </div>
        <div className="mt-2 text-2xl font-semibold">Partly Sunny</div>
        <p className="text-sm text-text-muted">
          Excessive heat reported across the property.
        </p>
      </div>
      <div className="flex items-center gap-2 text-accent-orange">
        <ThermometerHigh size={18} />
        <span className="text-sm font-semibold">Heat Advisory</span>
      </div>
    </div>
  );
}
