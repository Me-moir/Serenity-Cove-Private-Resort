const trafficFlags = [
  "Dashboard load increased by 18% during noon peak.",
  "Report generation queue is approaching capacity.",
  "Mobile usage is currently 62% of active sessions."
];

export default function FlagsSubtab3Page() {
  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Traffic Monitor</h1>
      <p className="mt-2 text-text-muted">
        Placeholder feed for user traffic, request load, and queue pressure.
      </p>

      <ul className="mt-4 space-y-2 text-sm text-text-muted">
        {trafficFlags.map((entry) => (
          <li key={entry}>- {entry}</li>
        ))}
      </ul>
    </div>
  );
}
