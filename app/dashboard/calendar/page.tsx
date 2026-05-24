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
        <details className="rounded-3xl bg-card-dark p-5 text-text-on-dark">
          <summary className="cursor-pointer text-sm font-semibold tracking-[0.3em] text-text-on-dark">
            REPORTS
          </summary>
          <div className="mt-4">
            <ReportsPanel />
          </div>
        </details>
      </div>
    </div>
  );
}
