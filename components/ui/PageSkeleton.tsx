function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-border/50 ${className}`} />;
}

export function TablePageSkeleton() {
  return (
    <div className="space-y-5">
      <Pulse className="h-9 w-52 rounded-2xl" />

      <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">
        {/* toolbar */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Pulse className="h-9 w-56" />
          <Pulse className="h-9 w-24" />
          <Pulse className="ml-auto h-8 w-8" />
        </div>
        {/* header row */}
        <div className="animate-pulse h-11 bg-border/20" />
        {/* rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-5 border-b border-border px-6 py-4">
            <Pulse className="h-4 w-36" />
            <Pulse className="h-4 w-20" />
            <Pulse className="h-6 w-16 rounded-full" />
            <Pulse className="h-4 w-28" />
            <Pulse className="ml-auto h-6 w-20 rounded-full" />
          </div>
        ))}
        {/* footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <Pulse className="h-3 w-40" />
          <Pulse className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <Pulse className="h-9 w-52 rounded-2xl" />

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card-light p-5 shadow-sm">
            <Pulse className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-8 w-16" />
              <Pulse className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl bg-card-light shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <Pulse className="h-4 w-32" />
              <Pulse className="ml-auto h-5 w-10 rounded-full" />
            </div>
            <div className="space-y-0 divide-y divide-border">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between px-6 py-3">
                  <div className="space-y-1.5">
                    <Pulse className="h-4 w-32" />
                    <Pulse className="h-3 w-44" />
                  </div>
                  <Pulse className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div className="space-y-5">
      <Pulse className="h-9 w-52 rounded-2xl" />
      <Pulse className="h-64 w-full rounded-3xl" />
      <Pulse className="h-96 w-full rounded-3xl" />
    </div>
  );
}
