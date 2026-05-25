export const FLOORS = [
  {
    id: "floor3",
    label: "Floor 3 — Penthouse",
    areas: [
      {
        id: "master-suite",
        label: "Master Suite",
        tasks: [
          "King bed made & dressed",
          "Pillow cases changed",
          "AC pre-set to 22°C",
          "Smart TV tested",
          "Blackout curtains checked",
          "Fresh towels placed",
          "Mini-bar restocked",
          "En-suite bathroom stocked",
        ],
      },
      {
        id: "private-balcony",
        label: "Private Balcony",
        tasks: [
          "Furniture wiped down",
          "Floor swept and mopped",
          "Potted plants watered",
          "Ambient lights checked",
        ],
      },
    ],
  },
  {
    id: "floor2",
    label: "Floor 2 — Upper Level",
    areas: [
      {
        id: "vip-guest-suite",
        label: "VIP Guest Suite",
        tasks: [
          "Queen bed made",
          "Welcome amenities placed",
          "Private bathroom stocked",
          "Smart TV tested",
          "AC checked",
        ],
      },
      {
        id: "guest-suite-1",
        label: "Guest Suite 1",
        tasks: ["Bed made", "Fresh towels placed", "Closet cleared", "TV tested"],
      },
      {
        id: "guest-suite-2",
        label: "Guest Suite 2",
        tasks: ["Bed made", "Fresh towels placed", "Closet cleared", "TV tested"],
      },
      {
        id: "barkada-room",
        label: "Barkada Room",
        tasks: [
          "All 4 beds made",
          "Linens and pillow cases changed",
          "Floor swept",
          "Extra blankets ready",
        ],
      },
      {
        id: "kiddie-room",
        label: "Kiddie Room",
        tasks: [
          "Bunk bed made",
          "Area childproofed",
          "Toys organized",
          "Night light checked",
          "Floor sanitized",
        ],
      },
      {
        id: "library-study",
        label: "Library / Study",
        tasks: [
          "Books and shelves dusted",
          "Desk and chairs wiped",
          "AC and lighting checked",
        ],
      },
    ],
  },
  {
    id: "floor1",
    label: "Floor 1 — Main Level",
    areas: [
      {
        id: "grand-foyer",
        label: "Grand Foyer",
        tasks: [
          "Floors polished",
          "Welcome arrangement set",
          "Lighting fixtures checked",
          "Coat rack and umbrella stand cleared",
        ],
      },
      {
        id: "living-room",
        label: "Living Room",
        tasks: [
          "Sofas arranged",
          '85" Smart TV tested',
          "Sound system checked",
          "Karaoke mic and speakers tested",
          "Coffee table cleaned",
          "Curtains straightened",
        ],
      },
      {
        id: "bar-lounge",
        label: "Bar & Lounge",
        tasks: [
          "Bar counter wiped",
          "Glassware polished and arranged",
          "Refrigerator stocked",
          "Ice maker checked",
          "Bar stools arranged",
        ],
      },
      {
        id: "kitchen-dining",
        label: "Kitchen & Dining",
        tasks: [
          "16-seater table cleaned",
          "Utensils and cookware complete",
          "Fridge cleared of prior items",
          "Sink cleaned",
          "Appliances wiped",
          "Trash bins emptied",
        ],
      },
      {
        id: "home-theater",
        label: "Home Theater",
        tasks: [
          "Projector and screen checked",
          "Surround sound tested",
          "Recliner seats arranged",
          "Ambient lighting set",
          "Popcorn machine cleaned",
        ],
      },
      {
        id: "gym",
        label: "Gym / Fitness",
        tasks: [
          "Equipment wiped down",
          "Yoga mats cleaned",
          "Mirror cleaned",
          "AC and fan tested",
          "Towels stocked",
        ],
      },
      {
        id: "main-bathroom",
        label: "Main Bathroom",
        tasks: [
          "Toiletries restocked",
          "Mirrors cleaned",
          "Floors mopped",
          "Towels replaced",
        ],
      },
    ],
  },
  {
    id: "basement",
    label: "Basement",
    areas: [
      {
        id: "wine-cellar",
        label: "Wine Cellar",
        tasks: [
          "Bottles organized and labeled",
          "Temperature maintained at 15°C",
          "Shelves dusted",
          "Lighting checked",
        ],
      },
      {
        id: "game-room",
        label: "Game Room",
        tasks: [
          "Gaming consoles and controllers tested",
          "Pool table brushed",
          "Arcade machines checked",
          "Snack counter cleaned",
          "Seating arranged",
        ],
      },
      {
        id: "sauna",
        label: "Sauna Room",
        tasks: [
          "Sauna stones checked",
          "Temperature pre-set to 80°C",
          "Wooden benches cleaned",
          "Towels and robes stocked",
          "Drainage checked",
        ],
      },
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor Areas",
    areas: [
      {
        id: "main-pool",
        label: "Main Pool",
        tasks: [
          "Water level checked",
          "Chemicals balanced",
          "Pool vacuumed and skimmed",
          "Fountain system tested",
          "Safety floats in place",
          "Underwater lights tested",
        ],
      },
      {
        id: "kiddie-pool",
        label: "Kiddie Pool",
        tasks: [
          "Water level checked",
          "Cleanliness checked",
          "Safety rails secured",
          "Area sanitized",
        ],
      },
      {
        id: "bbq-area",
        label: "BBQ & Grill Area",
        tasks: [
          "Grill cleaned and ready",
          "Charcoal / gas stocked",
          "Prep table wiped",
          "Utensils laid out",
        ],
      },
      {
        id: "garden",
        label: "Garden & Landscape",
        tasks: [
          "Grass mowed and edged",
          "Pathways swept",
          "Potted plants watered",
          "Decorative fountain checked",
        ],
      },
      {
        id: "outdoor-dining",
        label: "Outdoor Dining",
        tasks: [
          "Tables and chairs wiped",
          "String lights tested",
          "Floor swept",
          "Tablecloths replaced",
        ],
      },
      {
        id: "parking",
        label: "Parking Area",
        tasks: [
          "Area swept",
          "Slot markings visible",
          "Lighting functional",
          "Trash bins emptied",
        ],
      },
    ],
  },
];

export interface ChecklistArea {
  id: string;
  label: string;
  tasks: string[];
}

export interface ChecklistFloor {
  id: string;
  label: string;
  areas: ChecklistArea[];
}

export const AREAS: ChecklistArea[] = (FLOORS as ChecklistFloor[]).flatMap((f) => f.areas);

export type PrepCheckState = Record<string, Record<string, boolean>>;
export type CheckedState = Record<string, boolean>;
export type NoteState = Record<string, string>;
export type RoomStatus = "Being Prepared" | "Ready for Check-In" | "Vacant";

export const STATUS_CFG: Record<RoomStatus, { dot: string; badge: string }> = {
  "Being Prepared": {
    dot: "bg-accent-orange shadow-[0_0_6px_var(--color-accent-orange)]",
    badge: "bg-accent-orange/10 border-accent-orange/20 text-accent-orange",
  },
  "Ready for Check-In": {
    dot: "bg-accent-green shadow-[0_0_6px_var(--color-accent-green)]",
    badge: "bg-accent-green/10 border-accent-green/20 text-accent-green",
  },
  Vacant: {
    dot: "bg-accent-blue shadow-[0_0_6px_var(--color-accent-blue)]",
    badge: "bg-accent-blue/10 border-accent-blue/20 text-accent-blue",
  },
};

export function buildInitPrepChecks(): PrepCheckState {
  const s: PrepCheckState = {};
  AREAS.forEach((a) => {
    s[a.id] = {};
    a.tasks.forEach((t: string) => (s[a.id][t] = false));
  });
  return s;
}

export const INIT_PREP_CHECKS = buildInitPrepChecks();
export const INIT_CHECKED_OUT: CheckedState = Object.fromEntries(
  AREAS.map((a) => [a.id, false])
);
export const INIT_DAMAGE_NOTES: NoteState = Object.fromEntries(
  AREAS.map((a) => [a.id, ""])
);
export const INIT_PREP_NOTES: NoteState = Object.fromEntries(
  AREAS.map((a) => [a.id, ""])
);

export function getRoomStatus(
  prepChecks: Record<string, boolean>,
  isCheckedOut: boolean
): RoomStatus {
  if (isCheckedOut) return "Vacant";
  return Object.values(prepChecks).every(Boolean) ? "Ready for Check-In" : "Being Prepared";
}

// Used by the Area Prep tab — only vacant rooms are shown there,
// so the two relevant statuses are prep progress, not checkout state.
export type PrepStatus = "Being Prepared" | "Ready for Check-In";

export const PREP_STATUS_CFG: Record<PrepStatus, { dot: string; badge: string }> = {
  "Being Prepared": {
    dot: "bg-accent-orange shadow-[0_0_6px_var(--color-accent-orange)]",
    badge: "bg-accent-orange/10 border-accent-orange/20 text-accent-orange",
  },
  "Ready for Check-In": {
    dot: "bg-accent-green shadow-[0_0_6px_var(--color-accent-green)]",
    badge: "bg-accent-green/10 border-accent-green/20 text-accent-green",
  },
};

export function getPrepStatus(prepChecks: Record<string, boolean>): PrepStatus {
  if (!prepChecks || Object.keys(prepChecks).length === 0) return "Being Prepared";
  return Object.values(prepChecks).every(Boolean) ? "Ready for Check-In" : "Being Prepared";
}

export function safeLS<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const LS_KEYS = {
  prepChecks: "sc-cleaning-checks",
  prepNotes:  "sc-cleaning-notes",
  checkout:   "sc-checkout-checked",
  damage:     "sc-checkout-notes",
} as const;
