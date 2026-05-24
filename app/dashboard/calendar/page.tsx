import CalendarView from "@/components/dashboard/CalendarView";
import ReportsPanel from "@/components/dashboard/ReportsPanel";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <CalendarView />
        <div className="hidden lg:block">
          <ReportsPanel />
        </div>
      </div>

      <div className="lg:hidden">
        <details className="overflow-hidden rounded-3xl border border-white/10 bg-card-dark text-text-on-dark">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold tracking-[0.2em] text-text-on-dark">
            REPORTS
          </summary>
          <div className="px-2 pb-2">
            <ReportsPanel />
          </div>
        </details>
      </div>
    </div>
  );
}
