import { getCalendarEvents } from "@/lib/data/queries";

const flagTypeStyles: Record<string, string> = {
  "Flags Reported": "bg-accent-orange/15 text-accent-orange",
  "Unresolved Incidence": "bg-accent-red/15 text-accent-red",
  "Need Attention": "bg-accent-blue/15 text-accent-blue",
  Important: "bg-accent-green/15 text-accent-green",
};

export default async function FlagsSubtab2Page() {
  const events = await getCalendarEvents();

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar Flags</h1>
        <span className="text-sm text-text-muted">{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No calendar flag events found.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((event) => (
            <article key={event.event_id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{event.event_date}</div>
                  {event.reservations?.order_id && (
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {event.reservations.order_id}
                    </div>
                  )}
                  {event.notes && (
                    <p className="mt-2 text-sm text-text-muted">{event.notes}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${flagTypeStyles[event.flag_type] ?? ""}`}>
                  {event.flag_type}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
