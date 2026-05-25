import { redirect } from "next/navigation";

export default function ChangelogPage() {
  redirect("/dashboard/changelog/recent-updates");
}
