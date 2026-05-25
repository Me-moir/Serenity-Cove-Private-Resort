"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface VenuePayload {
  venue_name: string;
  category: string;
  price_per_night: number;
  description: string | null;
  is_active: boolean;
}

export async function updateVenue(id: number, payload: VenuePayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("venue_price_list").update(payload).eq("venue_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-6");
}

export async function deleteVenue(id: number) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("venue_price_list").delete().eq("venue_id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-6");
}
