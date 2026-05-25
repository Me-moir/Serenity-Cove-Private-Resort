import { createSupabaseServiceClient } from "@/lib/supabase/service";
import ReservationRecords from "@/components/dashboard/ReservationRecords";

export const dynamic = "force-dynamic";

export default async function ReservationRecordsPage() {
  const sb = createSupabaseServiceClient();

  const [reservationsResult, venuesResult] = await Promise.all([
    sb
      .from("reservations")
      .select("*, guests(first_name, last_name, guest_type), reservation_venues(price_snapshot, venue_price_list(venue_name, category))")
      .order("created_at", { ascending: false }),
    sb
      .from("venue_price_list")
      .select("venue_id, venue_name, category, price_per_night")
      .eq("is_active", true)
      .order("category")
      .order("venue_name"),
  ]);

  return (
    <ReservationRecords
      reservations={reservationsResult.data ?? []}
      venues={venuesResult.data ?? []}
    />
  );
}
