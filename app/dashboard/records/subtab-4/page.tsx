import { createSupabaseServiceClient } from "@/lib/supabase/service";
import ReservationRecords from "@/components/dashboard/ReservationRecords";

export const dynamic = "force-dynamic";

export default async function ReservationRecordsPage() {
  const sb = createSupabaseServiceClient();

  const { data: reservations } = await sb
    .from("reservations")
    .select("*, guests(first_name, last_name, guest_type)")
    .in("approval_status", ["Approved", "Rejected"])
    .order("actioned_at", { ascending: false })
    .order("created_at", { ascending: false });

  return <ReservationRecords reservations={reservations ?? []} />;
}
