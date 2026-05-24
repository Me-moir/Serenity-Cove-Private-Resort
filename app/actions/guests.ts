"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface GuestPayload {
  first_name: string;
  last_name: string;
  guest_type: "New" | "Returning" | "VIP";
  contact_number: string | null;
  email: string | null;
  total_bookings: number;
  last_stay: string | null;
}

export async function addGuest(payload: GuestPayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("guests").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-1");
  revalidatePath("/dashboard/guests");
}

export async function updateGuest(guestId: number, payload: GuestPayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("guests").update(payload).eq("guest_id", guestId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-1");
  revalidatePath("/dashboard/guests");
}

export async function deleteGuest(guestId: number) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("guests").delete().eq("guest_id", guestId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/subtab-1");
  revalidatePath("/dashboard/guests");
}
