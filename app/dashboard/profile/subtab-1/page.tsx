import SectionDivider from "@/components/ui/SectionDivider";

const profileStats = [
  { label: "Role", value: "System Administrator" },
  { label: "Department", value: "Operations Control" },
  { label: "Last Login", value: "May 24, 2026 - 08:11 AM" },
  { label: "Access Level", value: "Full Dashboard Access" }
];

export default function ProfileSubtab1Page() {
  return (
    <div className="space-y-8">
      <SectionDivider label="Profile" />

      <div className="rounded-3xl bg-card-light p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Account Overview</h1>
        <p className="mt-2 text-text-muted">Core administrator profile details.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {profileStats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-border p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-text-muted">
                {item.label}
              </div>
              <div className="mt-2 text-sm font-semibold">{item.value}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
