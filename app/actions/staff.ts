"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface StaffPayload {
  staff_name: string;
  role: string;
  contact_number: string | null;
}

export async function updateStaff(id: number, payload: StaffPayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("staff").update(payload).eq("staff_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-5");
}

export async function deleteStaff(id: number) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("staff").delete().eq("staff_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-5");
}

export async function getStaffForProvider() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("staff")
    .select("staff_id, staff_name, role, contact_number")
    .order("staff_id");
  return (data ?? []) as {
    staff_id: number;
    staff_name: string;
    role: string;
    contact_number: string | null;
  }[];
}
