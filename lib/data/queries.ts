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
  ReservationWithGuestAndAddons,
  ReviewWithGuest,
  Staff,
} from "@/types/database";

export async function getGuestStats(): Promise<GuestStats> {
  const fallback: GuestStats = { total: 0, new: 0, returning: 0, vip: 0 };
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("guests").select("guest_type");
    if (error || !data) return fallback;

    const stats: GuestStats = { total: data.length, new: 0, returning: 0, vip: 0 };
    for (const g of data) {
      if (g.guest_type === "New") stats.new++;
      else if (g.guest_type === "Returning") stats.returning++;
      else if (g.guest_type === "VIP") stats.vip++;
    }
    return stats;
  } catch {
    return fallback;
  }
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const fallback: FinanceSummary = { revenue: 0, outstanding: 0, refunds: 0, cancellations: 0 };
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("financial_records")
      .select("record_type, amount");
    if (error || !data) return fallback;

    const summary: FinanceSummary = { revenue: 0, outstanding: 0, refunds: 0, cancellations: 0 };
    for (const r of data) {
      const amount = Number(r.amount);
      if (r.record_type === "Revenue") summary.revenue += amount;
      else if (r.record_type === "Outstanding Balance") summary.outstanding += amount;
      else if (r.record_type === "Refund") summary.refunds += amount;
      else if (r.record_type === "Cancellation") summary.cancellations += amount;
    }
    return summary;
  } catch {
    return fallback;
  }
}

export async function getGuests(): Promise<Guest[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Guest[];
  } catch {
    return [];
  }
}

export async function getReservations(): Promise<ReservationWithGuest[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("*, guests(first_name, last_name, guest_type)")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as ReservationWithGuest[];
  } catch {
    return [];
  }
}

export async function getReviews(): Promise<ReviewWithGuest[]> {
  try {
    const supabase = createSupabaseServiceClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("review_id, guest_id, reservation_id, rating, review_text, review_date")
      .order("review_date", { ascending: false });

    if (error) {
      console.error("[getReviews]", error.message);
      return [];
    }
    if (!reviews?.length) return [];

    const guestIds = [...new Set(reviews.map((r) => r.guest_id))];
    const { data: guests, error: guestError } = await supabase
      .from("guests")
      .select("guest_id, first_name, last_name, guest_type")
      .in("guest_id", guestIds);

    if (guestError) console.error("[getReviews guests]", guestError.message);

    const guestMap = Object.fromEntries(
      (guests ?? []).map((g) => [g.guest_id, g]),
    );

    return reviews.map((r) => ({
      ...r,
      guests: guestMap[r.guest_id]
        ? {
            first_name: guestMap[r.guest_id].first_name,
            last_name: guestMap[r.guest_id].last_name,
            guest_type: guestMap[r.guest_id].guest_type,
          }
        : null,
      reservations: null,
    })) as ReviewWithGuest[];
  } catch {
    return [];
  }
}

export async function getCleaningTasks(statuses?: string[]): Promise<CleaningTaskWithRelations[]> {
  try {
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
  } catch {
    return [];
  }
}

export async function getFinancialRecords(): Promise<FinancialRecordWithReservation[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("financial_records")
      .select("*, reservations(order_id)")
      .order("record_date", { ascending: false });
    if (error || !data) return [];
    return data as FinancialRecordWithReservation[];
  } catch {
    return [];
  }
}

export async function getIncidents(): Promise<IncidentWithGuest[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("incidents")
      .select("*, guests(first_name, last_name), reservations(order_id)")
      .order("reported_at", { ascending: false });
    if (error || !data) return [];
    return data as IncidentWithGuest[];
  } catch {
    return [];
  }
}

export async function getReservationAddons(): Promise<ReservationAddonWithReservation[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("reservation_addons")
      .select("*, reservations(order_id)")
      .order("addon_id", { ascending: false });
    if (error || !data) return [];
    return data as ReservationAddonWithReservation[];
  } catch {
    return [];
  }
}

export async function getCalendarEvents(): Promise<CalendarEventWithReservation[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*, reservations(order_id)")
      .order("event_date", { ascending: false });
    if (error || !data) return [];
    return data as CalendarEventWithReservation[];
  } catch {
    return [];
  }
}

export async function getStaff(): Promise<Staff[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("staff").select("*").order("staff_name");
    if (error || !data) return [];
    return data as Staff[];
  } catch {
    return [];
  }
}

export async function getVenuePriceList() {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("venue_price_list")
      .select("*")
      .order("category")
      .order("venue_name");
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getTodaysReservation(): Promise<ReservationWithGuestAndAddons | null> {
  try {
    const supabase = createSupabaseServiceClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("reservations")
      .select("*, guests(first_name, last_name, guest_type), reservation_addons(addon_name, addon_category)")
      .eq("approval_status", "Approved")
      .gte("check_in_date", today)
      .order("check_in_date", { ascending: true })
      .order("check_in_time", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as ReservationWithGuestAndAddons;
  } catch {
    return null;
  }
}

export async function getReservationStats() {
  const fallback = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalGuests: 0,
    totalRevenue: 0,
    bySource: {} as Record<string, number>,
  };
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("approval_status, payment_status, booking_source, adult_count, children_count, total_price");

    if (error || !data) return fallback;

    const stats = { ...fallback };
    stats.total = data.length;

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
  } catch {
    return fallback;
  }
}
