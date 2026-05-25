import { createSupabaseServiceClient } from "@/lib/supabase/service";
import ReservationApproval from "@/components/dashboard/ReservationApproval";

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const supabase = createSupabaseServiceClient();

  const [reservationsResult, guestsResult, venuesResult] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, guests(first_name, last_name, guest_type), reservation_addons(addon_name, addon_category), reservation_venues(price_snapshot, venue_price_list(venue_name, category))")
      .eq("approval_status", "Pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("guests")
      .select("guest_id, first_name, last_name, guest_type")
      .order("last_name"),
    supabase
      .from("venue_price_list")
      .select("venue_id, venue_name, category, price_per_night")
      .eq("is_active", true)
      .order("category")
      .order("venue_name"),
  ]);

  return (
    <ReservationApproval
      reservations={reservationsResult.data ?? []}
      guests={guestsResult.data ?? []}
      venues={venuesResult.data ?? []}
    />
  );
}
