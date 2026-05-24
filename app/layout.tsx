import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geist = GeistSans;
const themeInitScript = `
(() => {
  try {
    const storageKey = "home-dashboard-theme-preset";
    const savedPreset = localStorage.getItem(storageKey);
    const isValidPreset =
      savedPreset === "light" || savedPreset === "dark" || savedPreset === "system";
    const preset = isValidPreset ? savedPreset : "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = preset === "system" ? (prefersDark ? "dark" : "light") : preset;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch {}
})();
`;

export const metadata: Metadata = {
  title: "Home Dashboard",
  description: "Hospitality and venue management dashboard"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-shell text-text-on-light antialiased transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
