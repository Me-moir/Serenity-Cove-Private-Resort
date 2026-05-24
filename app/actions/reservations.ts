"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function updateApprovalStatus(
  reservationId: number,
  status: "Approved" | "Rejected",
) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb
    .from("reservations")
    .update({ approval_status: status })
    .eq("reservation_id", reservationId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/reservation");
}

interface ReservationPayload {
  order_id: string;
  guest_id: number;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  adult_count: number;
  children_count: number;
  total_price: number;
  payment_status: string;
  approval_status: string;
  booking_source: string;
  special_notes: string | null;
}

interface AddonPayload {
  addon_name: string;
  addon_category: string | null;
}

export async function addReservation(
  payload: ReservationPayload,
  addons: AddonPayload[],
) {
  const sb = createSupabaseServiceClient();

  const { data: newRes, error } = await sb
    .from("reservations")
    .insert(payload)
    .select("reservation_id")
    .single();

  if (error) throw new Error(error.message);

  if (newRes && addons.length > 0) {
    const { error: addonError } = await sb.from("reservation_addons").insert(
      addons.map((a) => ({
        reservation_id: newRes.reservation_id,
        addon_name: a.addon_name,
        addon_category: a.addon_category,
      })),
    );
    if (addonError) throw new Error(addonError.message);
  }

  revalidatePath("/dashboard/reservation");
}
