"use client";

import { createContext, useContext, useState } from "react";
import { STAFF } from "@/lib/data/staff";

type Assignments = Record<string, string[]>; // staffId → area names

interface StaffAssignmentContextValue {
  assignments: Assignments;
  updateStaffAreas: (staffId: string, areas: string[]) => void;
  staffForArea: (areaName: string) => string[];
}

const StaffAssignmentContext = createContext<StaffAssignmentContextValue | null>(null);

export function StaffAssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignments] = useState<Assignments>(() =>
    Object.fromEntries(STAFF.map((s) => [s.id, [...s.areas]]))
  );

  const updateStaffAreas = (staffId: string, areas: string[]) =>
    setAssignments((prev) => ({ ...prev, [staffId]: areas }));

  const staffForArea = (areaName: string): string[] =>
    STAFF.filter((s) => assignments[s.id]?.includes(areaName)).map((s) => s.name);

  return (
    <StaffAssignmentContext.Provider value={{ assignments, updateStaffAreas, staffForArea }}>
      {children}
    </StaffAssignmentContext.Provider>
  );
}

export function useStaffAssignments() {
  const ctx = useContext(StaffAssignmentContext);
  if (!ctx) throw new Error("useStaffAssignments must be used inside StaffAssignmentProvider");
  return ctx;
}
