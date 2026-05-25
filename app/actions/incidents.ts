"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface IncidentPayload {
  description: string;
  status: "None" | "Reported" | "Pending" | "Resolved";
  resolved_at: string | null;
}

export async function updateIncident(id: number, payload: IncidentPayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("incidents").update(payload).eq("incident_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-3");
}

export async function deleteIncident(id: number) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("incidents").delete().eq("incident_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-3");
}
