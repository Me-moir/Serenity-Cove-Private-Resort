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
  revalidatePath("/dashboard/records/guest-records");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/reservation");
}

export async function updateGuest(guestId: number, payload: GuestPayload) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("guests").update(payload).eq("guest_id", guestId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/guest-records");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/reservation");
}

export async function deleteGuest(guestId: number) {
  const sb = createSupabaseServiceClient();

  // Collect reservation IDs owned by this guest
  const { data: resRows } = await sb
    .from("reservations")
    .select("reservation_id")
    .eq("guest_id", guestId);

  const resIds = (resRows ?? []).map((r) => r.reservation_id as number);

  if (resIds.length > 0) {
    // Delete every table that FK-references reservations
    await sb.from("reservation_addons").delete().in("reservation_id", resIds);
    await sb.from("financial_records").delete().in("reservation_id", resIds);
    await sb.from("cleaning_tasks").delete().in("reservation_id", resIds);
    await sb.from("reviews").delete().in("reservation_id", resIds);
    await sb.from("incidents").delete().in("reservation_id", resIds);
    await sb.from("calendar_events").delete().in("reservation_id", resIds);

    // Delete the reservations themselves
    await sb.from("reservations").delete().in("reservation_id", resIds);
  }

  // Delete any guest-level records not tied to a specific reservation
  await sb.from("reviews").delete().eq("guest_id", guestId);
  await sb.from("incidents").delete().eq("guest_id", guestId);

  // Finally delete the guest
  const { error } = await sb.from("guests").delete().eq("guest_id", guestId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/records/guest-records");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/reservation");
  revalidatePath("/dashboard/records/financial-records");
  revalidatePath("/dashboard/records/incidents");
}
