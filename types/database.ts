export interface Admin {
  admin_id: number;
  employee_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  username: string;
  password_hash: string;
  email: string;
  personal_email: string | null;
  contact_number: string | null;
  role: string;
  gender: string | null;
  birthdate: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  created_at: string;
}

export interface AdminSession {
  session_id: number;
  admin_id: number;
  device_type: string | null;
  location: string | null;
  last_active: string;
  status: "Active" | "Expired" | "Revoked";
}

export interface Guest {
  guest_id: number;
  guest_name: string;
  guest_type: "New" | "Returning" | "VIP";
  contact_number: string | null;
  email: string | null;
  total_bookings: number;
  last_stay: string | null;
  created_at: string;
}

export interface Reservation {
  reservation_id: number;
  order_id: string;
  guest_id: number;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  adult_count: number;
  children_count: number;
  total_price: number;
  payment_status: "Pending" | "Partially Paid" | "Fully Paid";
  approval_status: "Pending" | "Approved" | "Rejected";
  booking_source: "Website" | "Social Media" | "OTA" | "OTC";
  special_notes: string | null;
  created_at: string;
}

export interface ReservationWithGuest extends Reservation {
  guests: Pick<Guest, "guest_name" | "guest_type"> | null;
}

export interface ReservationAddon {
  addon_id: number;
  reservation_id: number;
  addon_name: string;
  addon_category: string | null;
}

export interface ReservationAddonWithReservation extends ReservationAddon {
  reservations: Pick<Reservation, "order_id"> | null;
}

export interface FinancialRecord {
  record_id: number;
  reservation_id: number;
  record_type: "Revenue" | "Outstanding Balance" | "Refund" | "Cancellation";
  amount: number;
  reason: string | null;
  record_date: string;
}

export interface FinancialRecordWithReservation extends FinancialRecord {
  reservations: Pick<Reservation, "order_id"> | null;
}

export interface Incident {
  incident_id: number;
  guest_id: number;
  reservation_id: number | null;
  description: string;
  status: "None" | "Reported" | "Pending" | "Resolved";
  reported_at: string;
  resolved_at: string | null;
}

export interface IncidentWithGuest extends Incident {
  guests: Pick<Guest, "guest_name"> | null;
  reservations: Pick<Reservation, "order_id"> | null;
}

export interface CalendarEvent {
  event_id: number;
  reservation_id: number | null;
  event_date: string;
  flag_type:
    | "Flags Reported"
    | "Unresolved Incidence"
    | "Need Attention"
    | "Important";
  notes: string | null;
}

export interface CalendarEventWithReservation extends CalendarEvent {
  reservations: Pick<Reservation, "order_id"> | null;
}

export interface CleaningTask {
  task_id: number;
  reservation_id: number;
  staff_id: number | null;
  task_type: "Area Prep" | "Post Check-out" | "Checkout Checklist";
  status: "Pending" | "Being Prepared" | "In Progress" | "Done";
  items_completed: number;
  items_total: number;
  last_updated_by: string | null;
  last_updated_at: string;
}

export interface CleaningTaskWithRelations extends CleaningTask {
  reservations: Pick<Reservation, "order_id"> | null;
  staff: Pick<Staff, "staff_name"> | null;
}

export interface Staff {
  staff_id: number;
  staff_name: string;
  role: string;
  contact_number: string | null;
}

export interface Review {
  review_id: number;
  guest_id: number;
  reservation_id: number | null;
  rating: number;
  review_text: string | null;
  review_date: string;
}

export interface ReviewWithGuest extends Review {
  guests: Pick<Guest, "guest_name"> | null;
  reservations: Pick<Reservation, "order_id"> | null;
}

export interface GuestStats {
  total: number;
  new: number;
  returning: number;
  vip: number;
}

export interface FinanceSummary {
  revenue: number;
  outstanding: number;
  refunds: number;
  cancellations: number;
}
