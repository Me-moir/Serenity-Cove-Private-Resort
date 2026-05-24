"use client";

import {
  type ThemePreset,
  useTheme
} from "@/components/theme/ThemeProvider";
import SectionDivider from "@/components/ui/SectionDivider";

const themeOptions: Array<{
  label: string;
  value: ThemePreset;
  description: string;
}> = [
  {
    label: "Light",
    value: "light",
    description: "Use the light interface across the whole website."
  },
  {
    label: "Dark",
    value: "dark",
    description: "Use the dark interface across the whole website."
  },
  {
    label: "System",
    value: "system",
    description: "Follow your device theme automatically."
  }
];

export default function SettingsSubtab1Page() {
  const { themePreset, resolvedTheme, setThemePreset } = useTheme();

  return (
    <div className="space-y-8">
      <SectionDivider label="Settings" />

      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Appearance</h1>
        <p className="mt-2 text-text-muted">
          Configure interface behavior and appearance presets.
        </p>

        <div className="mt-6 space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-text-muted">
            Theme preset (current: {resolvedTheme})
          </div>
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
                  className="mt-1 h-4 w-4 accent-accent-blue"
                />
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-sm text-text-muted">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
