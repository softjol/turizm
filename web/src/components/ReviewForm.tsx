import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { getMyBookings, getRoom, createReview } from "@/lib/api";

/**
 * "Leave a review" form on the estate detail page. Per the spec, only users who
 * actually stayed can review — so we look for one of the user's completed
 * bookings for this hotel and use its booking_id. If none exists, render nothing.
 */
export function ReviewForm({ hotelId, onSubmitted }: { hotelId: number; onSubmitted: () => void }) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      try {
        const bookings = await getMyBookings();
        const eligible = bookings.filter(
          (b) => b.status === "completed" || b.status === "checked_out",
        );
        for (const b of eligible) {
          const room = await getRoom(b.room_id).catch(() => null);
          if (room && room.hotel_id === hotelId) {
            if (active) setBookingId(b.id);
            break;
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (active) setChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, hotelId]);

  // Not logged in → a small hint so the section is discoverable.
  if (!isAuthenticated) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-card p-4 text-sm text-muted-foreground">
        {t("rv.loginToReview")}
      </div>
    );
  }
  if (done) {
    return (
      <div className="mt-4 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
        {t("rv.thanks")}
      </div>
    );
  }
  if (!checked) return null; // still loading bookings
  // Logged in but no completed stay here → explain where the review is (ТЗ rule).
  if (bookingId === null) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-card p-4 text-sm text-muted-foreground">
        {t("rv.needStay")}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bookingId === null) return;
    setSubmitting(true);
    setError(null);
    try {
      await createReview(hotelId, { booking_id: bookingId, rating, comment: comment.trim() });
      setDone(true);
      onSubmitted();
    } catch (err) {
      setError(
        isAxiosError(err)
          ? ((err.response?.data as { detail?: string } | undefined)?.detail ?? err.message)
          : t("rv.error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-border/70 bg-card p-5"
    >
      <div className="font-display text-lg font-bold">{t("rv.leaveTitle")}</div>
      {error && (
        <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="mt-3">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("rv.yourRating")}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              aria-label={`${i + 1}`}
            >
              <Star
                className={`h-7 w-7 ${i < rating ? "fill-warning text-warning" : "text-muted"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("rv.comment")}
        </div>
        <Textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("rv.commentPh")}
          required
          minLength={5}
        />
      </div>
      <Button type="submit" className="mt-4 rounded-xl" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("rv.submit")}
      </Button>
    </form>
  );
}
