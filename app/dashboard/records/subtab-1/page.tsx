import { createSupabaseServiceClient } from "@/lib/supabase/service";
import CustomerRecords from "@/components/dashboard/CustomerRecords";

export const dynamic = "force-dynamic";

export default async function RecordsSubtab1Page() {
  const supabase = createSupabaseServiceClient();

  const { data: guests } = await supabase
    .from("guests")
    .select(`
      *,
      reservations(order_id, created_at, check_in_date, check_out_date, adult_count, children_count),
      incidents(status, reported_at, resolved_at)
    `)
    .order("created_at", { ascending: false });

  return <CustomerRecords guests={guests ?? []} />;
}
