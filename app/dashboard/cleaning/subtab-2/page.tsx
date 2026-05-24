import { getCleaningTasks } from "@/lib/data/queries";

export default async function CleaningSubtab2Page() {
  const tasks = await getCleaningTasks(["In Progress"]);

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">In Progress</h1>
        <span className="text-sm text-text-muted">{tasks.length} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No tasks currently in progress.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {tasks.map((task) => {
            const progress =
              task.items_total > 0
                ? Math.round((task.items_completed / task.items_total) * 100)
                : null;
            return (
              <article key={task.task_id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{task.task_type}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {task.reservations?.order_id ?? "—"}
                    </div>
                    <div className="mt-1 text-sm text-text-muted">
                      Staff: {task.staff?.staff_name ?? "Unassigned"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-full bg-accent-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-green">
                      In Progress
                    </span>
                    {progress !== null && (
                      <div className="mt-2 text-xs text-text-muted">
                        {task.items_completed}/{task.items_total} items ({progress}%)
                      </div>
                    )}
                  </div>
                </div>
                {task.items_total > 0 && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-accent-green transition-all"
                      style={{ width: `${progress ?? 0}%` }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
