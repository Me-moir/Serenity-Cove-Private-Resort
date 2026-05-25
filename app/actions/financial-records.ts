"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface FinancialRecordPayload {
  record_type: "Revenue" | "Outstanding Balance" | "Refund" | "Cancellation";
  amount: number;
  reason: string | null;
  record_date: string;
}

export async function updateFinancialRecord(id: number, payload: FinancialRecordPayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("financial_records").update(payload).eq("record_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-2");
}

export async function deleteFinancialRecord(id: number) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("financial_records").delete().eq("record_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-2");
}
