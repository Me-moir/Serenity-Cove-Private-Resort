import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: "var(--color-shell)",
        sidebar: "var(--color-sidebar)",
        rail: "var(--color-rail)",
        topbar: "var(--color-topbar)",
        "card-dark": "var(--color-card-dark)",
        "card-light": "var(--color-card-light)",
        "text-on-dark": "var(--color-text-on-dark)",
        "text-on-light": "var(--color-text-on-light)",
        "text-muted": "var(--color-text-muted)",
        "accent-orange": "var(--color-accent-orange)",
        "accent-red": "var(--color-accent-red)",
        "accent-green": "var(--color-accent-green)",
        "accent-blue": "var(--color-accent-blue)",
        border: "var(--color-border)",
        "surface-soft": "var(--color-surface-soft)",
        "surface-soft-hover": "var(--color-surface-soft-hover)"
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "SF Pro Display",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
