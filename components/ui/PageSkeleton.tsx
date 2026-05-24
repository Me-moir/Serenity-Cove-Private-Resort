function Bone({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function TablePageSkeleton() {
  return (
    <div className="space-y-5">
      <Bone className="h-8 w-48 rounded-xl" />

      <div className="overflow-hidden rounded-3xl bg-card-light shadow-sm">
        {/* toolbar */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Bone className="h-9 w-64 rounded-xl" />
          <Bone className="h-9 w-28 rounded-xl" />
          <Bone className="ml-auto h-9 w-28 rounded-xl" />
        </div>

        {/* header row */}
        <div className="flex items-center gap-6 border-b border-border bg-border/20 px-6 py-3">
          {[48, 32, 20, 36, 24, 20].map((w, i) => (
            <Bone key={i} className={`h-3 w-${w}`} />
          ))}
        </div>

        {/* data rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-border/60 px-6 py-[14px]"
          >
            <Bone className="h-4 w-36" />
            <Bone className="h-4 w-28" />
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="h-4 w-24" />
            <Bone className="h-4 w-20" />
            <Bone className="ml-auto h-7 w-16 rounded-lg" />
          </div>
        ))}

        {/* footer / pagination */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <Bone className="h-3 w-44 rounded-md" />
          <div className="flex gap-2">
            <Bone className="h-7 w-7 rounded-lg" />
            <Bone className="h-7 w-7 rounded-lg" />
            <Bone className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <Bone className="h-8 w-52 rounded-xl" />

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card-light p-5 shadow-sm"
          >
            <Bone className="h-11 w-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5">
              <Bone className="h-7 w-14" />
              <Bone className="h-3 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* panels row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl bg-card-light shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Bone className="h-4 w-36 rounded-md" />
              <Bone className="h-5 w-10 rounded-full" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between px-6 py-3">
                  <div className="space-y-2">
                    <Bone className="h-4 w-32 rounded-md" />
                    <Bone className="h-3 w-44 rounded-md" />
                  </div>
                  <Bone className="h-6 w-16 rounded-full" />
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
      <Bone className="h-8 w-52 rounded-xl" />
      <Bone className="h-56 w-full rounded-3xl" />
      <Bone className="h-80 w-full rounded-3xl" />
    </div>
  );
}
