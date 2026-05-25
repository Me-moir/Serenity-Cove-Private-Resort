"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { STAFF } from "@/lib/data/staff";
import { getStaffForProvider } from "@/app/actions/staff";

export interface DbStaff {
  staff_id: number;
  staff_name: string;
  role: string;
  contact_number: string | null;
}

type Assignments = Record<string, string[]>; // String(staff_id) → area names

interface StaffAssignmentContextValue {
  dbStaff: DbStaff[];
  assignments: Assignments;
  updateStaffAreas: (staffId: string, areas: string[]) => void;
  staffForArea: (areaName: string) => string[];
}

const StaffAssignmentContext = createContext<StaffAssignmentContextValue | null>(null);

function buildInitialAssignments(dbStaff: DbStaff[]): Assignments {
  const result: Assignments = {};
  for (const member of dbStaff) {
    const hardcoded = STAFF.find(
      (s) => s.name.toLowerCase() === member.staff_name.toLowerCase(),
    );
    result[String(member.staff_id)] = hardcoded ? [...hardcoded.areas] : [];
  }
  return result;
}

export function StaffAssignmentProvider({ children }: { children: React.ReactNode }) {
  const [dbStaff, setDbStaff] = useState<DbStaff[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});

  useEffect(() => {
    getStaffForProvider().then((staff) => {
      setDbStaff(staff);
      setAssignments(buildInitialAssignments(staff));
    });
  }, []);

  const updateStaffAreas = (staffId: string, areas: string[]) =>
    setAssignments((prev) => ({ ...prev, [staffId]: areas }));

  const staffForArea = (areaName: string): string[] =>
    dbStaff
      .filter((s) => assignments[String(s.staff_id)]?.includes(areaName))
      .map((s) => s.staff_name);

  return (
    <StaffAssignmentContext.Provider value={{ dbStaff, assignments, updateStaffAreas, staffForArea }}>
      {children}
    </StaffAssignmentContext.Provider>
  );
}

export function useStaffAssignments() {
  const ctx = useContext(StaffAssignmentContext);
  if (!ctx) throw new Error("useStaffAssignments must be used inside StaffAssignmentProvider");
  return ctx;
}
