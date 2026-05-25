export const dynamic = "force-dynamic";

import { getVenuePriceList } from "@/lib/data/queries";
import VenueRecords from "@/components/dashboard/VenueRecords";

export default async function VenuePriceListPage() {
  const venues = await getVenuePriceList();
  return <VenueRecords venues={venues} />;
}
