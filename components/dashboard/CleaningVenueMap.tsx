"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useStaffAssignments } from "@/components/providers/StaffAssignmentProvider";
import {
  BookFill,
  ChevronDown,
  GeoAlt,
  CheckCircleFill,
  Circle,
  Cup,
  Droplet,
  Film,
  Flower1,
  Grid3x3GapFill,
  HouseFill,
  Joystick,
  Lightning,
  MoonFill,
  PeopleFill,
  PersonFill,
  Sun,
  Thermometer,
  Tv,
  Umbrella,
  Water,
  XLg,
} from "react-bootstrap-icons";

// ─── Types ─────────────────────────────────────────────────────────────────

type AreaId =
  | "master-suite"
  | "private-balcony"
  | "vip-guest-suite"
  | "guest-suite-1"
  | "guest-suite-2"
  | "barkada-room"
  | "kiddie-room"
  | "library-study"
  | "grand-foyer"
  | "living-room"
  | "bar-lounge"
  | "kitchen-dining"
  | "home-theater"
  | "gym"
  | "main-bathroom"
  | "wine-cellar"
  | "game-room"
  | "sauna"
  | "main-pool"
  | "kiddie-pool"
  | "bbq-area"
  | "garden"
  | "outdoor-dining"
  | "parking";

interface Area {
  id: AreaId;
  name: string;
  sub?: string;
  floor: string;
  items: string[];
  staff: string[];
  Icon: ComponentType<{ size?: number | string; className?: string }>;
}

// ─── Floor Sections ─────────────────────────────────────────────────────────

const FLOORS: { label: string; ids: AreaId[] }[] = [
  {
    label: "Floor 3 — Penthouse Level",
    ids: ["master-suite", "private-balcony"],
  },
  {
    label: "Floor 2 — Upper Level Bedrooms",
    ids: [
      "vip-guest-suite",
      "guest-suite-1",
      "guest-suite-2",
      "barkada-room",
      "kiddie-room",
      "library-study",
    ],
  },
  {
    label: "Floor 1 — Main Level",
    ids: [
      "grand-foyer",
      "living-room",
      "bar-lounge",
      "kitchen-dining",
      "home-theater",
      "gym",
      "main-bathroom",
    ],
  },
  {
    label: "Basement",
    ids: ["wine-cellar", "game-room", "sauna"],
  },
  {
    label: "Outdoor Areas",
    ids: ["main-pool", "kiddie-pool", "bbq-area", "garden", "outdoor-dining", "parking"],
  },
];

// ─── Area Data ──────────────────────────────────────────────────────────────

const AREAS: Area[] = [
  // FLOOR 3
  {
    id: "master-suite",
    name: "Master Suite",
    floor: "Floor 3 · Penthouse",
    Icon: MoonFill,
    staff: ["Maria Santos", "Jose Reyes"],
    items: [
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
    name: "Private Balcony",
    floor: "Floor 3 · Penthouse",
    Icon: Sun,
    staff: ["Rico Flores"],
    items: [
      "Furniture wiped down",
      "Floor swept and mopped",
      "Potted plants watered",
      "Ambient lights checked",
    ],
  },
  // FLOOR 2
  {
    id: "vip-guest-suite",
    name: "VIP Guest Suite",
    floor: "Floor 2 · Upper Level",
    Icon: MoonFill,
    staff: ["Ana Dela Cruz"],
    items: [
      "Queen bed made",
      "Welcome amenities placed",
      "Private bathroom stocked",
      "Smart TV tested",
      "AC checked",
    ],
  },
  {
    id: "guest-suite-1",
    name: "Guest Suite 1",
    floor: "Floor 2 · Upper Level",
    Icon: MoonFill,
    staff: ["Ana Dela Cruz"],
    items: ["Bed made", "Fresh towels placed", "Closet cleared", "TV tested"],
  },
  {
    id: "guest-suite-2",
    name: "Guest Suite 2",
    floor: "Floor 2 · Upper Level",
    Icon: MoonFill,
    staff: ["Donna Cruz"],
    items: ["Bed made", "Fresh towels placed", "Closet cleared", "TV tested"],
  },
  {
    id: "barkada-room",
    name: "Barkada Room",
    floor: "Floor 2 · Upper Level",
    Icon: PeopleFill,
    staff: ["Mark Gonzales"],
    items: [
      "All 4 beds made",
      "Linens and pillow cases changed",
      "Floor swept",
      "Extra blankets ready",
    ],
  },
  {
    id: "kiddie-room",
    name: "Kiddie Room",
    floor: "Floor 2 · Upper Level",
    Icon: PersonFill,
    staff: ["Lina Bautista"],
    items: [
      "Bunk bed made",
      "Area childproofed",
      "Toys organized",
      "Night light checked",
      "Floor sanitized",
    ],
  },
  {
    id: "library-study",
    name: "Library / Study",
    floor: "Floor 2 · Upper Level",
    Icon: BookFill,
    staff: ["Jose Reyes"],
    items: ["Books and shelves dusted", "Desk and chairs wiped", "AC and lighting checked"],
  },
  // FLOOR 1
  {
    id: "grand-foyer",
    name: "Grand Foyer",
    floor: "Floor 1 · Main Level",
    Icon: HouseFill,
    staff: ["Mark Gonzales"],
    items: [
      "Floors polished",
      "Welcome arrangement set",
      "Lighting fixtures checked",
      "Coat rack and umbrella stand cleared",
    ],
  },
  {
    id: "living-room",
    name: "Living Room",
    floor: "Floor 1 · Main Level",
    Icon: Tv,
    staff: ["Maria Santos", "Lina Bautista"],
    items: [
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
    name: "Bar & Lounge",
    floor: "Floor 1 · Main Level",
    Icon: Cup,
    staff: ["Rico Flores"],
    items: [
      "Bar counter wiped",
      "Glassware polished and arranged",
      "Refrigerator stocked",
      "Ice maker checked",
      "Bar stools arranged",
    ],
  },
  {
    id: "kitchen-dining",
    name: "Kitchen & Dining",
    floor: "Floor 1 · Main Level",
    Icon: Grid3x3GapFill,
    staff: ["Maria Santos", "Jose Reyes"],
    items: [
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
    name: "Home Theater",
    floor: "Floor 1 · Main Level",
    Icon: Film,
    staff: ["Donna Cruz"],
    items: [
      "Projector and screen checked",
      "Surround sound tested",
      "Recliner seats arranged",
      "Ambient lighting set",
      "Popcorn machine cleaned",
    ],
  },
  {
    id: "gym",
    name: "Gym / Fitness",
    floor: "Floor 1 · Main Level",
    Icon: Lightning,
    staff: ["Mark Gonzales"],
    items: [
      "Equipment wiped down",
      "Yoga mats cleaned",
      "Mirror cleaned",
      "AC and fan tested",
      "Towels stocked",
    ],
  },
  {
    id: "main-bathroom",
    name: "Main Bathroom",
    floor: "Floor 1 · Main Level",
    Icon: Droplet,
    staff: ["Lina Bautista"],
    items: ["Toiletries restocked", "Mirrors cleaned", "Floors mopped", "Towels replaced"],
  },
  // BASEMENT
  {
    id: "wine-cellar",
    name: "Wine Cellar",
    floor: "Basement",
    Icon: Cup,
    staff: ["Rico Flores"],
    items: [
      "Bottles organized and labeled",
      "Temperature maintained at 15°C",
      "Shelves dusted",
      "Lighting checked",
    ],
  },
  {
    id: "game-room",
    name: "Game Room",
    floor: "Basement",
    Icon: Joystick,
    staff: ["Donna Cruz"],
    items: [
      "Gaming consoles and controllers tested",
      "Pool table brushed",
      "Arcade machines checked",
      "Snack counter cleaned",
      "Seating arranged",
    ],
  },
  {
    id: "sauna",
    name: "Sauna Room",
    floor: "Basement",
    Icon: Thermometer,
    staff: ["Ana Dela Cruz"],
    items: [
      "Sauna stones checked",
      "Temperature pre-set to 80°C",
      "Wooden benches cleaned",
      "Towels and robes stocked",
      "Drainage checked",
    ],
  },
  // OUTDOOR
  {
    id: "main-pool",
    name: "Main Pool",
    sub: "6 ft deep",
    floor: "Outdoor",
    Icon: Water,
    staff: ["Rico Flores"],
    items: [
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
    name: "Kiddie Pool",
    sub: "2 ft",
    floor: "Outdoor",
    Icon: Water,
    staff: ["Lina Bautista"],
    items: [
      "Water level checked",
      "Cleanliness checked",
      "Safety rails secured",
      "Area sanitized",
    ],
  },
  {
    id: "bbq-area",
    name: "BBQ & Grill Area",
    floor: "Outdoor",
    Icon: Sun,
    staff: ["Mark Gonzales"],
    items: [
      "Grill cleaned and ready",
      "Charcoal / gas stocked",
      "Prep table wiped",
      "Utensils laid out",
    ],
  },
  {
    id: "garden",
    name: "Garden & Landscape",
    floor: "Outdoor",
    Icon: Flower1,
    staff: ["Rico Flores"],
    items: [
      "Grass mowed and edged",
      "Pathways swept",
      "Potted plants watered",
      "Decorative fountain checked",
    ],
  },
  {
    id: "outdoor-dining",
    name: "Outdoor Dining",
    sub: "Gazebo",
    floor: "Outdoor",
    Icon: Umbrella,
    staff: ["Donna Cruz"],
    items: [
      "Tables and chairs wiped",
      "String lights tested",
      "Floor swept",
      "Tablecloths replaced",
    ],
  },
  {
    id: "parking",
    name: "Parking Area",
    floor: "Outdoor",
    Icon: GeoAlt,
    staff: ["Jose Reyes"],
    items: [
      "Area swept",
      "Slot markings visible",
      "Lighting functional",
      "Trash bins emptied",
    ],
  },
];

const AREA_MAP = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<AreaId, Area>;

// ─── Component ─────────────────────────────────────────────────────────────

export default function CleaningVenueMap() {
  const { staffForArea } = useStaffAssignments();
  const [selected, setSelected] = useState<AreaId | null>(null);
  const [checked, setChecked] = useState<Record<AreaId, boolean[]>>(
    () =>
      Object.fromEntries(
        AREAS.map((a) => [a.id, new Array(a.items.length).fill(false)])
      ) as Record<AreaId, boolean[]>
  );

  const prog = (id: AreaId) => {
    const done = checked[id].filter(Boolean).length;
    const total = AREA_MAP[id].items.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const toggle = (id: AreaId, i: number) =>
    setChecked((p) => ({ ...p, [id]: p[id].map((v, j) => (j === i ? !v : v)) }));

  const markAll = (id: AreaId, val: boolean) =>
    setChecked((p) => ({ ...p, [id]: p[id].map(() => val) }));

  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set());

  const toggleFloor = (label: string) =>
    setCollapsedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const totalDone = AREAS.reduce((s, a) => s + prog(a.id).done, 0);
  const totalItems = AREAS.reduce((s, a) => s + prog(a.id).total, 0);
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const cardCls = (id: AreaId) => {
    const { done, total } = prog(id);
    if (selected === id)
      return "border-accent-blue/70 bg-accent-blue/25";
    if (total > 0 && done === total)
      return "border-accent-green/60 bg-accent-green/20";
    if (done > 0)
      return "border-accent-orange/50 bg-accent-orange/15";
    return "border-white/[0.08] bg-[#1E1E22] hover:border-white/[0.16] hover:bg-[#252529]";
  };

  const AVATAR_PALETTES = [
    "bg-accent-blue/15 text-accent-blue",
    "bg-accent-green/15 text-accent-green",
    "bg-accent-orange/10 text-accent-orange",
  ];

  function RoomCard({ id }: { id: AreaId }) {
    const area = AREA_MAP[id];
    const { done, total, pct } = prog(id);
    const Icon = area.Icon;
    const isSelected = selected === id;
    const isDone = total > 0 && done === total;

    return (
      <button
        type="button"
        onClick={() => setSelected((p) => (p === id ? null : id))}
        className={`group flex min-h-[80px] flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${cardCls(id)}`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold leading-tight text-white">
              {area.name}
            </div>
            {area.sub && <div className="text-[10px] text-white/50">{area.sub}</div>}
          </div>
          <Icon
            size={13}
            className={`mt-0.5 shrink-0 transition-colors duration-200 ${
              isSelected
                ? "text-accent-blue"
                : isDone
                ? "text-accent-green"
                : "text-white/35 group-hover:text-white/65"
            }`}
          />
        </div>
        <div className="mt-auto">
          <div className="mb-1 flex items-center justify-between">
            <span className={`text-[10px] ${done > 0 ? "font-medium text-white/75" : "text-white/35"}`}>
              {done}/{total}
            </span>
            {pct === 100 && total > 0 && (
              <span className="text-[10px] font-bold text-accent-green">Done</span>
            )}
            {pct > 0 && pct < 100 && (
              <span className="text-[10px] font-medium text-accent-orange">{pct}%</span>
            )}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.12]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pct === 100 ? "bg-accent-green" : pct > 0 ? "bg-accent-orange" : "bg-transparent"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </button>
    );
  }

  const selArea = selected ? AREA_MAP[selected] : null;
  const selProg = selected ? prog(selected) : null;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111114]">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">Venue Preparation</h1>
            <p className="mt-0.5 text-xs text-white/40">
              Select any room to view its checklist and assigned staff
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-4">
              {(
                [
                  { color: "bg-white/20", label: "Not started" },
                  { color: "bg-accent-orange", label: "In progress" },
                  { color: "bg-accent-green", label: "Complete" },
                  { color: "bg-accent-blue", label: "Selected" },
                ] as const
              ).map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-[10px] font-medium text-white/35">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-extrabold tabular-nums ${overallPct === 100 ? "text-accent-green" : "text-white"}`}>
              {overallPct}%
            </div>
            <div className="text-[10px] text-white/35">
              {totalDone}/{totalItems} items
            </div>
          </div>
        </div>
        <div className="h-2 bg-white/[0.08]">
          <div
            className={`h-full transition-all duration-500 ${
              overallPct === 100 ? "bg-accent-green" : "bg-accent-orange"
            }`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* ── 2-col layout ────────────────────────────────────────── */}
      <div className="flex items-start gap-4">

        {/* Left — 70% — Scrollable venue cards */}
        <div className="min-w-0 flex-[7] space-y-3">
          {FLOORS.map((floor) => {
            const isCollapsed = collapsedFloors.has(floor.label);
            const floorDone = floor.ids.filter((id) => prog(id).pct === 100).length;

            return (
            <div key={floor.label} className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111114]">

              {/* Floor header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-[3px] rounded-full bg-white/25" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                    {floor.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] tabular-nums text-white/25">
                    {floorDone}/{floor.ids.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFloor(floor.label)}
                    className="rounded-full p-1 text-white/30 transition-all hover:bg-white/[0.08] hover:text-white/60"
                    aria-label={isCollapsed ? "Expand floor" : "Collapse floor"}
                  >
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Collapsible grid */}
              <div
                className="overflow-hidden"
                style={{
                  display: "grid",
                  gridTemplateRows: isCollapsed ? "0fr" : "1fr",
                  transition: "grid-template-rows 280ms ease-in-out",
                }}
              >
                <div className="min-h-0">
                  <div className="grid grid-cols-3 gap-3 p-4">
                    {floor.ids.map((id) => (
                      <RoomCard key={id} id={id} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            );
          })}

        </div>

        {/* Right — 30% — Sticky detail panel, height fills to viewport bottom */}
        <div className="flex-[3] shrink-0 sticky top-4 h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-6rem)]">
          {selArea && selProg ? (
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card-light shadow-lg">

              {/* Panel header — fixed */}
              <div className="flex-none flex items-start justify-between border-b border-border bg-shell/30 px-5 py-4">
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight text-text-on-light">
                    {selArea.name}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent-blue/10 px-2 py-0.5">
                    <span className="text-[10px] font-medium text-accent-blue">{selArea.floor}</span>
                  </div>
                  {selArea.sub && (
                    <div className="mt-0.5 text-[10px] text-text-muted">{selArea.sub}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="ml-2 shrink-0 rounded-full p-1.5 text-text-muted hover:bg-accent-red/10 hover:text-accent-red transition-all"
                  aria-label="Close"
                >
                  <XLg size={12} />
                </button>
              </div>

              {/* Progress — fixed */}
              <div className="flex-none border-b border-border px-5 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-text-on-light">
                    {selProg.done} of {selProg.total} complete
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      selProg.pct === 100 ? "text-accent-green" : selProg.pct > 0 ? "text-accent-orange" : "text-text-muted"
                    }`}
                  >
                    {selProg.pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      selProg.pct === 100
                        ? "bg-accent-green"
                        : selProg.pct > 0
                        ? "bg-accent-orange"
                        : "bg-transparent"
                    }`}
                    style={{ width: `${selProg.pct}%` }}
                  />
                </div>
              </div>

              {/* Assigned Staff — fixed */}
              <div className="flex-none border-b border-border px-5 py-3">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <div className="h-3 w-[3px] rounded-full bg-accent-blue/60" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-on-light/70">
                    Assigned Staff
                  </span>
                </div>
                <div className="space-y-2">
                  {staffForArea(selArea.name).map((name, i) => (
                    <div key={name} className="flex items-center gap-2.5">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${AVATAR_PALETTES[i % AVATAR_PALETTES.length]}`}>
                        {name.charAt(0)}
                      </div>
                      <span className="text-xs text-text-on-light">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist header — fixed */}
              <div className="flex-none flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-[3px] rounded-full bg-accent-green/70" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-on-light/70">
                    Checklist
                  </span>
                </div>
                {selProg.done < selProg.total ? (
                  <button
                    type="button"
                    onClick={() => markAll(selected!, true)}
                    className="rounded-full border border-accent-blue/30 bg-accent-blue/5 px-2.5 py-0.5 text-[10px] font-semibold text-accent-blue hover:bg-accent-blue/15 transition-all"
                  >
                    Mark all done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => markAll(selected!, false)}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-text-muted hover:border-accent-red/40 hover:text-accent-red hover:bg-accent-red/5 transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Checklist items — scrollable, fills remaining height */}
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {selArea.items.map((item, idx) => {
                  const done = checked[selArea.id][idx];
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggle(selArea.id, idx)}
                      className={`group flex w-full items-center gap-3 border-l-2 py-3 pl-[18px] pr-5 text-left transition-all duration-150 ${
                        done
                          ? "border-accent-green/60 bg-accent-green/[0.03] hover:bg-accent-green/[0.06]"
                          : "border-transparent hover:border-accent-blue/50 hover:bg-shell/60"
                      }`}
                    >
                      {done ? (
                        <CheckCircleFill size={15} className="shrink-0 text-accent-green" />
                      ) : (
                        <Circle size={15} className="shrink-0 text-text-muted/40 group-hover:text-accent-blue/60 transition-colors" />
                      )}
                      <span
                        className={`text-xs transition-all ${
                          done ? "text-text-muted line-through decoration-accent-green/50" : "text-text-on-light"
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-card-light shadow-md">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-shell shadow-sm">
                <CheckCircleFill size={20} className="text-text-muted/30" />
              </div>
              <div className="text-sm font-semibold text-text-on-light">No room selected</div>
              <div className="mt-1.5 px-6 text-center text-xs leading-relaxed text-text-muted">
                Click any room card to view its checklist and assigned staff
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
