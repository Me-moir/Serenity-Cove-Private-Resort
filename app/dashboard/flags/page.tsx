import { redirect } from "next/navigation";

export default function FlagsPage() {
  redirect("/dashboard/flags/system-flags");
}
