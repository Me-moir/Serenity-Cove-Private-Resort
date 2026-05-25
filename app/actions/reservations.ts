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
    .update({ approval_status: status, actioned_at: new Date().toISOString() })
    .eq("reservation_id", reservationId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/reservation");
  revalidatePath("/dashboard/records/reservation-records");
}

// order_id is intentionally excluded — generated server-side in addReservation
interface ReservationPayload {
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

interface VenueSelection {
  venue_id: number;
  price_snapshot: number;
}

async function generateOrderId(
  sb: ReturnType<typeof createSupabaseServiceClient>,
): Promise<string> {
  const { data } = await sb
    .from("reservations")
    .select("order_id")
    .like("order_id", "RSV-%")
    .order("order_id", { ascending: false })
    .limit(50);

  let maxSeq = 0;
  for (const r of data ?? []) {
    const m = (r.order_id as string).match(/^RSV-(\d{4})/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxSeq) maxSeq = n;
    }
  }

  const next = String(maxSeq + 1).padStart(4, "0");
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  return `RSV-${next}${dd}${mo}${yy}`;
}

export async function addReservation(
  payload: ReservationPayload,
  addons: AddonPayload[],
  venues: VenueSelection[],
) {
  const sb = createSupabaseServiceClient();

  if (!payload.guest_id || !Number.isInteger(payload.guest_id) || payload.guest_id <= 0) {
    throw new Error("A valid guest must be selected.");
  }

  const { data: guestExists } = await sb
    .from("guests")
    .select("guest_id")
    .eq("guest_id", payload.guest_id)
    .maybeSingle();

  if (!guestExists) {
    throw new Error("Selected guest no longer exists. Please refresh the page and try again.");
  }

  // Retry up to 5 times in case of a concurrent insert hitting the same sequence
  let newRes: { reservation_id: number } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderId = await generateOrderId(sb);
    const { data, error } = await sb
      .from("reservations")
      .insert({ ...payload, order_id: orderId })
      .select("reservation_id")
      .single();

    if (!error) {
      newRes = data;
      break;
    }
    // 23505 = unique_violation — retry with a fresh sequence
    if ((error as { code?: string }).code !== "23505") {
      throw new Error(error.message);
    }
  }

  if (!newRes) {
    throw new Error("Failed to generate a unique Order ID. Please try again.");
  }

  if (newRes) {
    if (venues.length > 0) {
      const { error: venueError } = await sb.from("reservation_venues").insert(
        venues.map((v) => ({
          reservation_id: newRes.reservation_id,
          venue_id: v.venue_id,
          price_snapshot: v.price_snapshot,
        })),
      );
      if (venueError) throw new Error(venueError.message);
    }

    if (addons.length > 0) {
      const { error: addonError } = await sb.from("reservation_addons").insert(
        addons.map((a) => ({
          reservation_id: newRes.reservation_id,
          addon_name: a.addon_name,
          addon_category: a.addon_category,
        })),
      );
      if (addonError) throw new Error(addonError.message);
    }
  }

  revalidatePath("/dashboard/reservation");
}

interface RecordEditPayload {
  approval_status: "Pending" | "Approved" | "Rejected";
  payment_status: string;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  adult_count: number;
  children_count: number;
  total_price: number;
  special_notes: string | null;
}

export async function updateReservationRecord(
  reservationId: number,
  payload: RecordEditPayload,
  venues: VenueSelection[],
) {
  const sb = createSupabaseServiceClient();

  const { error } = await sb
    .from("reservations")
    .update(payload)
    .eq("reservation_id", reservationId);
  if (error) throw new Error(error.message);

  const { error: delError } = await sb
    .from("reservation_venues")
    .delete()
    .eq("reservation_id", reservationId);
  if (delError) throw new Error(delError.message);

  if (venues.length > 0) {
    const { error: insError } = await sb.from("reservation_venues").insert(
      venues.map((v) => ({
        reservation_id: reservationId,
        venue_id: v.venue_id,
        price_snapshot: v.price_snapshot,
      })),
    );
    if (insError) throw new Error(insError.message);
  }

  revalidatePath("/dashboard/records/reservation-records");
  revalidatePath("/dashboard/reservation");
}

export async function deleteReservation(reservationId: number) {
  const sb = createSupabaseServiceClient();
  const { error } = await sb
    .from("reservations")
    .delete()
    .eq("reservation_id", reservationId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/records/reservation-records");
  revalidatePath("/dashboard/reservation");
}
