export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getReservationReportData } from "@/lib/data/analytics-queries";
import ReservationReportsClient from "@/components/reports/ReservationReportsClient";
import ScopeFilter from "@/components/reports/ScopeFilter";

interface PageProps {
  searchParams: { from?: string; to?: string };
}

function getDefaultRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  return { from, to };
}

export default async function OccupancyReportsPage({ searchParams }: PageProps) {
  const defaults = getDefaultRange();
  const from = searchParams.from || defaults.from;
  const to = searchParams.to || defaults.to;

  const data = await getReservationReportData(from, to);

  return (
    <ReservationReportsClient
      data={data}
      scopeFilter={
        <Suspense fallback={null}>
          <ScopeFilter currentFrom={from} currentTo={to} />
        </Suspense>
      }
    />
  );
}
