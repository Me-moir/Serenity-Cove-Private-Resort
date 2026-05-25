"use client";

import { useEffect, useState } from "react";

const PREFS_KEY = "dashboard-privacy-preferences";

function Toggle({
  label,
  description,
  value,
  onToggle,
  locked,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle?: () => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-on-light">{label}</span>
          {locked && (
            <span className="rounded-full bg-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted">
              Required
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={onToggle}
        disabled={locked}
        className={`relative mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${
          value ? "bg-accent-blue" : "bg-border"
        }`}
      >
        <span
          className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
            value ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card-light p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-text-on-light">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}

export default function SettingsSubtab3Page() {
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [dataRetention, setDataRetention] = useState("90");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setAnalytics(p.analytics ?? true);
        setCrashReports(p.crashReports ?? true);
        setMarketingCookies(p.marketingCookies ?? false);
        setAnalyticsCookies(p.analyticsCookies ?? true);
        setSessionTimeout(p.sessionTimeout ?? "60");
        setDataRetention(p.dataRetention ?? "90");
      }
    } catch {}
  }, []);

  function handleSave() {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ analytics, crashReports, marketingCookies, analyticsCookies, sessionTimeout, dataRetention }),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  }

  const selectCls =
    "h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light focus:border-[#9a9a9a] focus:outline-none transition appearance-none";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light text-text-muted">
        Privacy &amp;{" "}
        <span className="font-semibold text-text-on-light">Preferences</span>
      </h1>

      {/* Data Privacy */}
      <SectionCard
        title="Data Privacy"
        description="Control how this dashboard collects and uses operational data."
      >
        <Toggle
          label="Necessary Cookies"
          description="Essential for authentication and core dashboard functionality. Cannot be disabled."
          value={true}
          locked
        />
        <div className="h-px bg-border" />
        <Toggle
          label="Analytics Cookies"
          description="Helps us understand how the dashboard is used to improve features and performance."
          value={analyticsCookies}
          onToggle={() => setAnalyticsCookies((p) => !p)}
        />
        <Toggle
          label="Marketing Cookies"
          description="Used for targeted content and promotional communications. Disabled by default."
          value={marketingCookies}
          onToggle={() => setMarketingCookies((p) => !p)}
        />
      </SectionCard>

      {/* Diagnostics */}
      <SectionCard
        title="Diagnostics & Reporting"
        description="Manage what diagnostic information is shared to improve system reliability."
      >
        <Toggle
          label="Usage Analytics"
          description="Sends anonymised page visit and interaction data to help improve the dashboard."
          value={analytics}
          onToggle={() => setAnalytics((p) => !p)}
        />
        <Toggle
          label="Crash Reports"
          description="Automatically sends error logs when the dashboard encounters an unexpected failure."
          value={crashReports}
          onToggle={() => setCrashReports((p) => !p)}
        />
      </SectionCard>

      {/* Session & Retention */}
      <div className="rounded-3xl border border-border bg-card-light p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text-on-light">Session &amp; Data Retention</h2>
        <p className="mt-1 text-sm text-text-muted">
          Configure automatic session expiry and how long records are kept.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
              Session Timeout
            </label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className={selectCls}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
              <option value="0">Never</option>
            </select>
            <p className="mt-1.5 text-xs text-text-muted">
              Automatically log out after this period of inactivity.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
              Log Retention Period
            </label>
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className={selectCls}
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
            </select>
            <p className="mt-1.5 text-xs text-text-muted">
              Activity and audit logs older than this are automatically purged.
            </p>
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="rounded-3xl border border-border bg-card-light p-6 shadow-sm">
        <h2 className="text-base font-semibold text-text-on-light">Your Data Rights</h2>
        <p className="mt-1 text-sm text-text-muted">
          You have the right to access, correct, or request deletion of your personal data at any time.
          Contact your system administrator to exercise these rights.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted transition hover:border-[#9a9a9a] hover:text-text-on-light"
          >
            Request Data Export
          </button>
          <button
            type="button"
            className="rounded-xl border border-accent-red/40 px-4 py-2 text-sm text-accent-red transition hover:border-accent-red hover:bg-accent-red/10"
          >
            Request Account Deletion
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs text-accent-green">Preferences saved.</span>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-topbar px-6 py-2.5 text-sm font-semibold text-text-on-dark transition hover:opacity-80"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
