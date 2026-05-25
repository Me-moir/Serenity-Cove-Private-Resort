export const dynamic = "force-dynamic";

import { getStaff } from "@/lib/data/queries";
import StaffRoster from "@/components/dashboard/StaffRoster";

export default async function StaffRosterPage() {
  const staff = await getStaff();
  return <StaffRoster staff={staff} />;
}
