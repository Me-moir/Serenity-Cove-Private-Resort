"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type ThemePreset = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  themePreset: ThemePreset;
  resolvedTheme: ResolvedTheme;
  setThemePreset: (preset: ThemePreset) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "home-dashboard-theme-preset";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreset(value: string | null): value is ThemePreset {
  return value === "light" || value === "dark" || value === "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreset, setThemePresetState] = useState<ThemePreset>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    applySystemTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", applySystemTheme);
      return () => {
        mediaQuery.removeEventListener("change", applySystemTheme);
      };
    }

    mediaQuery.addListener(applySystemTheme);
    return () => {
      mediaQuery.removeListener(applySystemTheme);
    };
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreset(savedTheme)) {
      setThemePresetState(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreset);
  }, [themePreset]);

  const resolvedTheme: ResolvedTheme =
    themePreset === "system" ? systemTheme : themePreset;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setThemePreset = useCallback((preset: ThemePreset) => {
    setThemePresetState(preset);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePresetState((currentPreset) => {
      const currentResolvedTheme =
        currentPreset === "system" ? systemTheme : currentPreset;
      return currentResolvedTheme === "dark" ? "light" : "dark";
    });
  }, [systemTheme]);

  const value = useMemo(
    () => ({
      themePreset,
      resolvedTheme,
      setThemePreset,
      toggleTheme
    }),
    [themePreset, resolvedTheme, setThemePreset, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
