export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getFinancialReportData } from "@/lib/data/analytics-queries";
import FinancialReportsClient from "@/components/reports/FinancialReportsClient";
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

export default async function RevenueReportsPage({ searchParams }: PageProps) {
  const defaults = getDefaultRange();
  const from = searchParams.from || defaults.from;
  const to = searchParams.to || defaults.to;

  const data = await getFinancialReportData(from, to);

  return (
    <FinancialReportsClient
      data={data}
      scopeFilter={
        <Suspense fallback={null}>
          <ScopeFilter currentFrom={from} currentTo={to} />
        </Suspense>
      }
    />
  );
}
