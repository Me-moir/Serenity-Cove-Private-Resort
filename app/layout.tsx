import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "../styles/globals.css";

const geist = GeistSans;

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
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-shell text-text-on-light antialiased">
        {children}
      </body>
    </html>
  );
}
