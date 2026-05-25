import { getReviews } from "@/lib/data/queries";
import CustomerFeedbackView from "@/components/dashboard/CustomerFeedbackView";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <CustomerFeedbackView reviews={reviews} />;
}
