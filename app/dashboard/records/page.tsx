import { redirect } from "next/navigation";

export default function RecordsPage() {
  redirect("/dashboard/records/guest-records");
}
