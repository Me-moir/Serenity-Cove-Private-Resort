export const dynamic = "force-dynamic";

import { getCleaningTasks } from "@/lib/data/queries";

const statusStyles: Record<string, string> = {
  Pending: "bg-accent-orange/15 text-accent-orange",
  "Being Prepared": "bg-accent-blue/15 text-accent-blue",
  "In Progress": "bg-accent-green/15 text-accent-green",
  Done: "bg-black/10 text-text-muted",
};

export default async function StaffTaskPage() {
  const tasks = await getCleaningTasks();

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff Tasks</h1>
        <span className="text-sm text-text-muted">{tasks.length} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No tasks found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-text-muted">
                <th className="pb-3 pr-4">Reservation</th>
                <th className="pb-3 pr-4">Task Type</th>
                <th className="pb-3 pr-4">Staff</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4 text-right">Progress</th>
                <th className="pb-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const progress =
                  task.items_total > 0
                    ? Math.round((task.items_completed / task.items_total) * 100)
                    : null;
                return (
                  <tr key={task.task_id} className="border-b border-border/50 hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 font-mono text-xs text-text-muted">
                      {task.reservations?.order_id ?? "—"}
                    </td>
                    <td className="py-3 pr-4 font-medium">{task.task_type}</td>
                    <td className="py-3 pr-4 text-text-muted">{task.staff?.staff_name ?? "Unassigned"}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${statusStyles[task.status] ?? ""}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-text-muted">
                      {progress !== null
                        ? `${task.items_completed}/${task.items_total} (${progress}%)`
                        : "—"}
                    </td>
                    <td className="py-3 text-text-muted">
                      {new Date(task.last_updated_at).toLocaleDateString("en-PH")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
