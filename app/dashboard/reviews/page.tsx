export const dynamic = "force-dynamic";

import { getReviews } from "@/lib/data/queries";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-accent-orange" : "text-text-muted/30"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="rounded-3xl bg-card-light p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        {reviews.length > 0 && (
          <div className="text-right">
            <div className="text-sm font-semibold">{avgRating.toFixed(1)} / 5</div>
            <div className="text-xs text-text-muted">{reviews.length} reviews</div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No reviews found.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <article key={review.review_id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{review.guests ? `${review.guests.first_name} ${review.guests.last_name}` : "Unknown Guest"}</div>
                  {review.reservations?.order_id && (
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      {review.reservations.order_id}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <StarRating rating={review.rating} />
                  <div className="mt-1 text-xs text-text-muted">{review.review_date}</div>
                </div>
              </div>
              {review.review_text && (
                <p className="mt-3 text-sm text-text-muted">{review.review_text}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
