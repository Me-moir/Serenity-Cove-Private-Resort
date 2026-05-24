import { createSupabaseServiceClient } from "@/lib/supabase/service";
import ReservationApproval from "@/components/dashboard/ReservationApproval";

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const supabase = createSupabaseServiceClient();

  const [reservationsResult, guestsResult] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, guests(guest_name, guest_type), reservation_addons(addon_name, addon_category)")
      .order("created_at", { ascending: false }),
    supabase
      .from("guests")
      .select("guest_id, guest_name, guest_type")
      .order("guest_name"),
  ]);

  return (
    <ReservationApproval
      reservations={reservationsResult.data ?? []}
      guests={guestsResult.data ?? []}
    />
  );
}
