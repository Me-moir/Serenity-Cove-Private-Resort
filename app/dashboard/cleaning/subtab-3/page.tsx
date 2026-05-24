export const dynamic = "force-dynamic";

import { getCleaningTasks } from "@/lib/data/queries";

export default async function CleaningSubtab3Page() {
  const tasks = await getCleaningTasks(["Done"]);

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Completed Tasks</h1>
        <span className="text-sm text-text-muted">{tasks.length} done</span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No completed tasks yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-text-muted">
                <th className="pb-3 pr-4">Reservation</th>
                <th className="pb-3 pr-4">Task Type</th>
                <th className="pb-3 pr-4">Staff</th>
                <th className="pb-3 pr-4 text-right">Items</th>
                <th className="pb-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id} className="border-b border-border/50 hover:bg-black/[0.02]">
                  <td className="py-3 pr-4 font-mono text-xs text-text-muted">
                    {task.reservations?.order_id ?? "—"}
                  </td>
                  <td className="py-3 pr-4 font-medium">{task.task_type}</td>
                  <td className="py-3 pr-4 text-text-muted">{task.staff?.staff_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-text-muted">
                    {task.items_total > 0 ? `${task.items_completed}/${task.items_total}` : "—"}
                  </td>
                  <td className="py-3 text-text-muted">
                    {new Date(task.last_updated_at).toLocaleDateString("en-PH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
