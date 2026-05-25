export const dynamic = "force-dynamic";

import { getIncidents } from "@/lib/data/queries";
import IncidentRecords from "@/components/dashboard/IncidentRecords";

export default async function RecordsSubtab3Page() {
  const incidents = await getIncidents();
  return <IncidentRecords incidents={incidents} />;
}
