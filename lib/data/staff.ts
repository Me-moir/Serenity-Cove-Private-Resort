export type StaffStatus = "On Duty" | "On Standby" | "Off Duty";
export type StaffColor = "blue" | "green" | "orange";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: StaffStatus;
  color: StaffColor;
  areas: string[];
}

export const STAFF: StaffMember[] = [
  {
    id: "MS-001",
    name: "Maria Santos",
    role: "Senior Housekeeper",
    shift: "Morning · 6 AM – 2 PM",
    status: "On Duty",
    color: "blue",
    areas: ["Master Suite", "Living Room", "Kitchen & Dining"],
  },
  {
    id: "JR-002",
    name: "Jose Reyes",
    role: "Housekeeper",
    shift: "Morning · 6 AM – 2 PM",
    status: "On Duty",
    color: "green",
    areas: ["Master Suite", "Library / Study", "Kitchen & Dining", "Parking Area"],
  },
  {
    id: "AD-003",
    name: "Ana Dela Cruz",
    role: "Room Attendant",
    shift: "Morning · 6 AM – 2 PM",
    status: "On Duty",
    color: "orange",
    areas: ["VIP Guest Suite", "Guest Suite 1", "Sauna Room"],
  },
  {
    id: "MG-004",
    name: "Mark Gonzales",
    role: "Facilities Staff",
    shift: "Morning · 6 AM – 2 PM",
    status: "On Duty",
    color: "blue",
    areas: ["Barkada Room", "Grand Foyer", "Gym / Fitness", "BBQ & Grill Area"],
  },
  {
    id: "LB-005",
    name: "Lina Bautista",
    role: "Housekeeper",
    shift: "Morning · 6 AM – 2 PM",
    status: "On Duty",
    color: "green",
    areas: ["Kiddie Room", "Living Room", "Main Bathroom", "Kiddie Pool"],
  },
  {
    id: "RF-006",
    name: "Rico Flores",
    role: "Groundskeeper",
    shift: "Morning · 6 AM – 2 PM",
    status: "On Duty",
    color: "orange",
    areas: ["Private Balcony", "Bar & Lounge", "Wine Cellar", "Main Pool", "Garden & Landscape"],
  },
  {
    id: "DC-007",
    name: "Donna Cruz",
    role: "Room Attendant",
    shift: "Afternoon · 2 PM – 10 PM",
    status: "On Standby",
    color: "blue",
    areas: ["Guest Suite 2", "Home Theater", "Game Room", "Outdoor Dining"],
  },
];

export const STATUS_STYLES: Record<StaffStatus, { dot: string; label: string }> = {
  "On Duty":    { dot: "bg-accent-green",  label: "text-accent-green" },
  "On Standby": { dot: "bg-accent-orange", label: "text-accent-orange" },
  "Off Duty":   { dot: "bg-white/30",      label: "text-white/40" },
};

export const COLOR_STYLES: Record<StaffColor, { avatar: string; tag: string }> = {
  blue:   { avatar: "bg-accent-blue/25 text-accent-blue",     tag: "bg-accent-blue/15 text-accent-blue" },
  green:  { avatar: "bg-accent-green/25 text-accent-green",   tag: "bg-accent-green/15 text-accent-green" },
  orange: { avatar: "bg-accent-orange/20 text-accent-orange", tag: "bg-accent-orange/15 text-accent-orange" },
};
