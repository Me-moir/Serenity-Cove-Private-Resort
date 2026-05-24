import { getIncidents } from "@/lib/data/queries";

const statusStyles: Record<string, string> = {
  None: "bg-black/10 text-text-muted",
  Reported: "bg-accent-orange/15 text-accent-orange",
  Pending: "bg-accent-blue/15 text-accent-blue",
  Resolved: "bg-accent-green/15 text-accent-green",
};

export default async function RecordsSubtab3Page() {
  const incidents = await getIncidents();

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Incidents</h1>
        <span className="text-sm text-text-muted">{incidents.length} total</span>
      </div>

      {incidents.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No incidents found.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {incidents.map((inc) => (
            <article key={inc.incident_id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{inc.guests?.guest_name ?? "Unknown Guest"}</div>
                  {inc.reservations?.order_id && (
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {inc.reservations.order_id}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-text-muted">{inc.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${statusStyles[inc.status] ?? ""}`}>
                    {inc.status}
                  </span>
                  <div className="mt-2 text-xs text-text-muted">
                    {new Date(inc.reported_at).toLocaleDateString("en-PH")}
                  </div>
                  {inc.resolved_at && (
                    <div className="mt-0.5 text-xs text-accent-green">
                      Resolved {new Date(inc.resolved_at).toLocaleDateString("en-PH")}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
