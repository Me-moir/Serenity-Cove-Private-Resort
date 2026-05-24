import SectionDivider from "@/components/ui/SectionDivider";
import { getIncidents } from "@/lib/data/queries";

const statusStyles: Record<string, string> = {
  None: "bg-black/10 text-text-muted",
  Reported: "bg-accent-orange/15 text-accent-orange",
  Pending: "bg-accent-blue/15 text-accent-blue",
  Resolved: "bg-accent-green/15 text-accent-green",
};

export default async function FlagsSubtab1Page() {
  const incidents = await getIncidents();
  const active = incidents.filter((i) => i.status !== "Resolved" && i.status !== "None");

  return (
    <div className="space-y-8">
      <SectionDivider label="Flags" />

      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Active Incidents</h1>
          <span className="text-sm text-text-muted">{active.length} active</span>
        </div>

        {active.length === 0 ? (
          <p className="mt-6 text-sm text-text-muted">No active incidents.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {active.map((inc) => (
              <article key={inc.incident_id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{inc.guests?.guest_name ?? "Unknown Guest"}</h2>
                    {inc.reservations?.order_id && (
                      <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                        {inc.reservations.order_id}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-text-muted">{inc.description}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${statusStyles[inc.status] ?? ""}`}>
                    {inc.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-text-muted">
                  Reported {new Date(inc.reported_at).toLocaleDateString("en-PH")}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
