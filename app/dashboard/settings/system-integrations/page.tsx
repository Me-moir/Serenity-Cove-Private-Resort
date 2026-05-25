const integrations = [
  {
    title: "Calendar API",
    description: "Syncs event scheduling and booking calendar data.",
  },
  {
    title: "Weather API",
    description: "Fetches live weather conditions for the venue location.",
  },
  {
    title: "Map API",
    description: "Provides location and mapping services for guest navigation.",
  },
  {
    title: "Currency API",
    description: "Retrieves real-time exchange rates for billing and reports.",
  },
];

export default function SettingsSubtab2Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-text-muted">
          System{" "}
          <span className="font-semibold text-text-on-light">Integrations</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure integrated API systems.
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map((api) => (
          <div
            key={api.title}
            className="flex items-center justify-between rounded-2xl border border-border bg-card-light p-6 shadow-sm"
          >
            <div>
              <h3 className="text-base font-semibold text-text-on-light">
                {api.title}
              </h3>
              <p className="mt-0.5 text-sm text-text-muted">{api.description}</p>
            </div>

            <button
              type="button"
              className="ml-6 shrink-0 rounded-xl bg-topbar px-6 py-2 text-sm font-semibold text-text-on-dark transition hover:opacity-80"
            >
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
