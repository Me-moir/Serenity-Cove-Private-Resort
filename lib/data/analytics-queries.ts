import { createSupabaseServiceClient } from "@/lib/supabase/service";

const FINANCIAL_FALLBACK = {
  totalRevenue: 0,
  outstandingBalance: 0,
  totalRefundsAndCancellations: 0,
  weeklyRevenue: [] as { week: string; gross: number }[],
  outstandingBalances: [] as { guest_name: string; order_id: string; check_in: string; check_out: string; amount: number }[],
  refundEntries: [] as { guest_name: string; order_id: string; reason: string; amount: number }[],
};

export async function getFinancialReportData(from: string, to: string) {
  try {
    const supabase = createSupabaseServiceClient();

    const { data: records, error: recError } = await supabase
      .from("financial_records")
      .select("record_type, amount, reason, record_date, reservation_id")
      .gte("record_date", from)
      .lte("record_date", to)
      .order("record_date", { ascending: true });

    if (recError || !records) return FINANCIAL_FALLBACK;

    const revenue = records.filter((r) => r.record_type === "Revenue");
    const outstanding = records.filter((r) => r.record_type === "Outstanding Balance");
    const refunds = records.filter((r) => r.record_type === "Refund");
    const cancellations = records.filter((r) => r.record_type === "Cancellation");

    const totalRevenue = revenue.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const outstandingBalance = outstanding.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const totalRefundsAndCancellations = [...refunds, ...cancellations].reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0,
    );

    const weeklyMap: Record<string, number> = {};
    for (const r of revenue) {
      const d = new Date(r.record_date);
      const weekNum = Math.ceil(d.getDate() / 7);
      const label = `${d.toLocaleString("default", { month: "short" })} ${(weekNum - 1) * 7 + 1}`;
      weeklyMap[label] = (weeklyMap[label] || 0) + Number(r.amount || 0);
    }
    const weeklyRevenue = Object.entries(weeklyMap).map(([week, gross]) => ({ week, gross }));

    const allResIds = [...outstanding, ...refunds, ...cancellations]
      .map((r) => r.reservation_id)
      .filter(Boolean);

    let reservationMap: Record<
      number,
      { order_id: string; check_in: string; check_out: string; guest_name: string }
    > = {};

    if (allResIds.length > 0) {
      const { data: reservations } = await supabase
        .from("reservations")
        .select("reservation_id, order_id, check_in_date, check_out_date, guests(first_name, last_name)")
        .in("reservation_id", allResIds);

      for (const res of reservations || []) {
        const g = res.guests as unknown as { first_name: string; last_name: string } | null;
        reservationMap[res.reservation_id] = {
          order_id: res.order_id || `#${res.reservation_id}`,
          check_in: new Date(res.check_in_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          check_out: new Date(res.check_out_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          guest_name: g ? `${g.first_name} ${g.last_name}` : "Unknown",
        };
      }
    }

    const outstandingBalances = outstanding.slice(0, 5).map((rec) => {
      const res = reservationMap[rec.reservation_id] ?? {
        order_id: `#${rec.reservation_id}`,
        check_in: "—",
        check_out: "—",
        guest_name: "Unknown",
      };
      return {
        guest_name: res.guest_name,
        order_id: res.order_id,
        check_in: res.check_in,
        check_out: res.check_out,
        amount: Number(rec.amount || 0),
      };
    });

    const refundEntries = [...refunds, ...cancellations].slice(0, 5).map((rec) => {
      const res = reservationMap[rec.reservation_id] ?? {
        order_id: `#${rec.reservation_id}`,
        guest_name: "Unknown",
      };
      return {
        guest_name: res.guest_name,
        order_id: res.order_id,
        reason: rec.reason || rec.record_type,
        amount: Number(rec.amount || 0),
      };
    });

    return {
      totalRevenue,
      outstandingBalance,
      totalRefundsAndCancellations,
      weeklyRevenue,
      outstandingBalances,
      refundEntries,
    };
  } catch {
    return FINANCIAL_FALLBACK;
  }
}

const RESERVATION_FALLBACK = {
  occupancyByWeek: [] as { week: number; rate: number }[],
  bookingFrequency: [] as { week: number; count: number }[],
  peakDates: [] as { ranking: number; date: string; bookings_count: number; occupancy: number }[],
  reservationSources: [] as { source: string; count: number; percentage: number }[],
  frequentGuests: [] as { name: string; type: string; total_bookings: number; last_stay: string }[],
};

export async function getReservationReportData(from: string, to: string) {
  try {
    const supabase = createSupabaseServiceClient();

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("reservation_id, check_in_date, check_out_date, booking_source, approval_status, created_at, guest_id")
      .gte("check_in_date", from)
      .lte("check_out_date", to)
      .neq("approval_status", "Rejected");

    if (error || !reservations) return RESERVATION_FALLBACK;

    const TOTAL_ROOMS = 10;

    const weekOccMap: Record<number, number> = {};
    for (const r of reservations) {
      const d = new Date(r.check_in_date);
      const week = Math.ceil(d.getDate() / 7);
      weekOccMap[week] = (weekOccMap[week] || 0) + 1;
    }
    const occupancyByWeek = Object.entries(weekOccMap)
      .map(([week, count]) => ({
        week: Number(week),
        rate: Math.min(100, Math.round((count / TOTAL_ROOMS) * 100)),
      }))
      .sort((a, b) => a.week - b.week);

    const freqMap: Record<number, number> = {};
    for (const r of reservations) {
      const d = new Date(r.created_at);
      const week = Math.ceil(d.getDate() / 7);
      freqMap[week] = (freqMap[week] || 0) + 1;
    }
    const bookingFrequency = Object.entries(freqMap)
      .map(([week, count]) => ({ week: Number(week), count }))
      .sort((a, b) => a.week - b.week);

    const dateMap: Record<string, number> = {};
    for (const r of reservations) {
      const d = new Date(r.check_in_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      dateMap[d] = (dateMap[d] || 0) + 1;
    }
    const peakDates = Object.entries(dateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([date, count], i) => ({
        ranking: i + 1,
        date,
        bookings_count: count,
        occupancy: Math.min(100, Math.round((count / TOTAL_ROOMS) * 100)),
      }));

    const sourceMap: Record<string, number> = {};
    for (const r of reservations) {
      const s = r.booking_source || "Website";
      sourceMap[s] = (sourceMap[s] || 0) + 1;
    }
    const total = reservations.length || 1;
    const reservationSources = Object.entries(sourceMap).map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    const { data: guests } = await supabase
      .from("guests")
      .select("guest_id, first_name, last_name, guest_type, total_bookings, last_stay")
      .order("total_bookings", { ascending: false })
      .limit(4);

    const frequentGuests = (guests || []).map((g) => ({
      name: `${g.first_name} ${g.last_name}`,
      type: g.guest_type || "New",
      total_bookings: g.total_bookings || 0,
      last_stay: g.last_stay
        ? new Date(g.last_stay).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    }));

    return { occupancyByWeek, bookingFrequency, peakDates, reservationSources, frequentGuests };
  } catch {
    return RESERVATION_FALLBACK;
  }
}
