import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  CalendarEventWithReservation,
  CleaningTaskWithRelations,
  FinancialRecordWithReservation,
  FinanceSummary,
  Guest,
  GuestStats,
  IncidentWithGuest,
  ReservationAddonWithReservation,
  ReservationWithGuest,
  ReviewWithGuest,
  Staff,
} from "@/types/database";

export async function getGuestStats(): Promise<GuestStats> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("guests")
    .select("guest_type");

  if (error || !data) {
    return { total: 0, new: 0, returning: 0, vip: 0 };
  }

  const stats: GuestStats = { total: data.length, new: 0, returning: 0, vip: 0 };
  for (const g of data) {
    if (g.guest_type === "New") stats.new++;
    else if (g.guest_type === "Returning") stats.returning++;
    else if (g.guest_type === "VIP") stats.vip++;
  }
  return stats;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("financial_records")
    .select("record_type, amount");

  if (error || !data) {
    return { revenue: 0, outstanding: 0, refunds: 0, cancellations: 0 };
  }

  const summary: FinanceSummary = { revenue: 0, outstanding: 0, refunds: 0, cancellations: 0 };
  for (const r of data) {
    const amount = Number(r.amount);
    if (r.record_type === "Revenue") summary.revenue += amount;
    else if (r.record_type === "Outstanding Balance") summary.outstanding += amount;
    else if (r.record_type === "Refund") summary.refunds += amount;
    else if (r.record_type === "Cancellation") summary.cancellations += amount;
  }
  return summary;
}

export async function getGuests(): Promise<Guest[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Guest[];
}

export async function getReservations(): Promise<ReservationWithGuest[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*, guests(first_name, last_name, guest_type)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as ReservationWithGuest[];
}

export async function getReviews(): Promise<ReviewWithGuest[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, guests(first_name, last_name, guest_type), reservations(order_id)")
    .order("review_date", { ascending: false });

  if (error || !data) return [];
  return data as ReviewWithGuest[];
}

export async function getCleaningTasks(
  statuses?: string[]
): Promise<CleaningTaskWithRelations[]> {
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("cleaning_tasks")
    .select("*, reservations(order_id), staff(staff_name)")
    .order("last_updated_at", { ascending: false });

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as CleaningTaskWithRelations[];
}

export async function getFinancialRecords(): Promise<FinancialRecordWithReservation[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("financial_records")
    .select("*, reservations(order_id)")
    .order("record_date", { ascending: false });

  if (error || !data) return [];
  return data as FinancialRecordWithReservation[];
}

export async function getIncidents(): Promise<IncidentWithGuest[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*, guests(first_name, last_name), reservations(order_id)")
    .order("reported_at", { ascending: false });

  if (error || !data) return [];
  return data as IncidentWithGuest[];
}

export async function getReservationAddons(): Promise<ReservationAddonWithReservation[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("reservation_addons")
    .select("*, reservations(order_id)")
    .order("addon_id", { ascending: false });

  if (error || !data) return [];
  return data as ReservationAddonWithReservation[];
}

export async function getCalendarEvents(): Promise<CalendarEventWithReservation[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*, reservations(order_id)")
    .order("event_date", { ascending: false });

  if (error || !data) return [];
  return data as CalendarEventWithReservation[];
}

export async function getStaff(): Promise<Staff[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("staff_name");

  if (error || !data) return [];
  return data as Staff[];
}

export async function getReservationStats() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("approval_status, payment_status, booking_source, adult_count, children_count, total_price");

  if (error || !data) {
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      totalGuests: 0,
      totalRevenue: 0,
      bySource: {} as Record<string, number>,
    };
  }

  const stats = {
    total: data.length,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalGuests: 0,
    totalRevenue: 0,
    bySource: {} as Record<string, number>,
  };

  for (const r of data) {
    if (r.approval_status === "Approved") stats.approved++;
    else if (r.approval_status === "Pending") stats.pending++;
    else if (r.approval_status === "Rejected") stats.rejected++;

    stats.totalGuests += (r.adult_count ?? 0) + (r.children_count ?? 0);
    if (r.payment_status === "Fully Paid") {
      stats.totalRevenue += Number(r.total_price ?? 0);
    }

    const src = r.booking_source ?? "Unknown";
    stats.bySource[src] = (stats.bySource[src] ?? 0) + 1;
  }

  return stats;
}
