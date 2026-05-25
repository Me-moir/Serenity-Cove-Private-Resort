export const dynamic = "force-dynamic";

import { getFinancialRecords } from "@/lib/data/queries";
import FinancialRecords from "@/components/dashboard/FinancialRecords";

export default async function RecordsSubtab2Page() {
  const records = await getFinancialRecords();
  return <FinancialRecords records={records} />;
}
