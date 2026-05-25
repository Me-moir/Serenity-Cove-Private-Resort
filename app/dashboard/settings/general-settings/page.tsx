"use client";

import { useEffect, useState } from "react";
import { type ThemePreset, useTheme } from "@/components/theme/ThemeProvider";

const NOTIF_KEY = "dashboard-notification-settings";

const themeOptions: Array<{ label: string; value: ThemePreset; description: string }> = [
  { label: "Light", value: "light", description: "Use the light interface across the whole website." },
  { label: "Dark", value: "dark", description: "Use the dark interface across the whole website." },
  { label: "System Default", value: "system", description: "Follow your device theme automatically." },
];

function Toggle({
  label,
  value,
  onToggle,
  disabled,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-text-on-light">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={onToggle}
        disabled={disabled}
        className={`relative flex h-5 w-9 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${
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

function saveNotifs(data: object) {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(data));
  } catch {}
}

export default function SettingsSubtab1Page() {
  const { themePreset, resolvedTheme, setThemePreset } = useTheme();

  const [allowNotifications, setAllowNotifications] = useState(false);
  const [calendarNotif, setCalendarNotif] = useState(false);
  const [newBookingNotif, setNewBookingNotif] = useState(false);
  const [bookingCancelledNotif, setBookingCancelledNotif] = useState(false);
  const [clearData, setClearData] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setAllowNotifications(p.allowNotifications ?? false);
        setCalendarNotif(p.calendarNotif ?? false);
        setNewBookingNotif(p.newBookingNotif ?? false);
        setBookingCancelledNotif(p.bookingCancelledNotif ?? false);
      }
    } catch {}
  }, []);

  function toggle(
    key: "allowNotifications" | "calendarNotif" | "newBookingNotif" | "bookingCancelledNotif",
    current: boolean,
    setter: (v: boolean) => void,
  ) {
    const next = !current;
    setter(next);
    const updated = {
      allowNotifications,
      calendarNotif,
      newBookingNotif,
      bookingCancelledNotif,
      [key]: next,
    };
    saveNotifs(updated);
  }

  async function handleLogout() {
    if (clearData) {
      localStorage.clear();
      sessionStorage.clear();
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    }
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-light text-text-muted">
          General{" "}
          <span className="font-semibold text-text-on-light">Settings</span>
        </h1>
      </div>

      {/* Appearance */}
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card-light p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text-on-light">Appearance</h2>
        <p className="mt-1 text-sm text-text-muted">
          Adjust system theme preset and appearance.
        </p>
        <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Current preset:{" "}
          <span className="font-semibold text-text-on-light">
            {themePreset.toUpperCase()} ({resolvedTheme})
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {themeOptions.map((option) => {
            const isSelected = themePreset === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-accent-blue bg-surface-soft"
                    : "border-border hover:border-text-muted/60"
                }`}
              >
                <input
                  type="radio"
                  name="theme-preset"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setThemePreset(option.value)}
                  className="mt-0.5 h-4 w-4 accent-accent-blue"
                />
                <span>
                  <span className="block text-sm font-semibold text-text-on-light">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-text-muted">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card-light p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text-on-light">Notifications</h2>
        <p className="mt-1 text-sm text-text-muted">
          Adjust system notification settings.
        </p>
        <div className="mt-6 space-y-4">
          <Toggle
            label="Allow Notifications"
            value={allowNotifications}
            onToggle={() => toggle("allowNotifications", allowNotifications, setAllowNotifications)}
          />
          <div
            className={`space-y-4 border-l-2 border-border pl-5 transition-opacity duration-200 ${
              allowNotifications ? "opacity-100" : "pointer-events-none opacity-30"
            }`}
          >
            <Toggle
              label="Calendar Notification"
              value={calendarNotif}
              onToggle={() => toggle("calendarNotif", calendarNotif, setCalendarNotif)}
              disabled={!allowNotifications}
            />
            <Toggle
              label="New Booking Notification"
              value={newBookingNotif}
              onToggle={() => toggle("newBookingNotif", newBookingNotif, setNewBookingNotif)}
              disabled={!allowNotifications}
            />
            <Toggle
              label="Booking Cancelled Notification"
              value={bookingCancelledNotif}
              onToggle={() => toggle("bookingCancelledNotif", bookingCancelledNotif, setBookingCancelledNotif)}
              disabled={!allowNotifications}
            />
          </div>
        </div>
      </div>

      {/* Logout — bottom center */}
      <div className="w-full max-w-2xl">
        <div className="h-px bg-border" />
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-48 rounded-xl bg-accent-red px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-80"
          >
            Log Out
          </button>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={clearData}
              onChange={() => setClearData((p) => !p)}
              className="h-4 w-4 accent-accent-red"
            />
            <span className="text-xs text-text-muted">
              Clear cookies and cache after logout
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
