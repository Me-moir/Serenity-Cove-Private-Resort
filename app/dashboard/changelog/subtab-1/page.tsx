import SectionDivider from "@/components/ui/SectionDivider";

const releases = [
  {
    version: "v2.6.0",
    date: "May 24, 2026",
    notes: ["Improved sidebar animation performance.", "Added sticky sidebar behavior across dashboard views."]
  },
  {
    version: "v2.5.4",
    date: "May 18, 2026",
    notes: ["Patched reservation export bug.", "Updated reports query caching."]
  },
  {
    version: "v2.4.0",
    date: "May 03, 2026",
    notes: ["Dashboard visual revamp.", "Introduced command menu improvements."]
  }
];

export default function ChangelogSubtab1Page() {
  return (
    <div className="space-y-8">
      <SectionDivider label="Changelog" />

      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Recent Updates</h1>
        <p className="mt-2 text-text-muted">Latest released updates across the dashboard.</p>

        <div className="mt-6 space-y-4">
          {releases.map((release) => (
            <article key={release.version} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{release.version}</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  {release.date}
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {release.notes.map((note) => (
                  <li key={note}>- {note}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
