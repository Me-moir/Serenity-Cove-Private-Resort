import SectionDivider from "@/components/ui/SectionDivider";

const systemFlags = [
  { title: "Payment API Timeout", severity: "High", detail: "Intermittent failures from 08:20 to 08:47." },
  { title: "Reservation Sync Delay", severity: "Medium", detail: "Average sync lag reached 2 minutes." },
  { title: "Guest Portal Login Errors", severity: "High", detail: "12 failed sessions detected in the last hour." }
];

export default function FlagsSubtab1Page() {
  return (
    <div className="space-y-8">
      <SectionDivider label="Flags" />

      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">System Flags</h1>
        <p className="mt-2 text-text-muted">
          Live placeholders for system crashes and operational incidents.
        </p>

        <div className="mt-6 space-y-3">
          {systemFlags.map((flag) => (
            <article key={flag.title} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{flag.title}</h2>
                <span className="rounded-full bg-topbar px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-on-dark">
                  {flag.severity}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-muted">{flag.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
