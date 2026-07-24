import { useEffect, useState } from "react";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  listReceptionHotels,
  getHotelReviews,
  replyToReview,
  type ReviewResponse,
  type Hotel,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { translateApiError } from "@/lib/apiError";

export default function HostReviews() {
  const { t } = useI18n();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listReceptionHotels()
      .then((hs) => {
        if (!active) return;
        setHotels(hs);
        setHotelId(hs[0]?.id ?? null);
      })
      .catch((err) => console.error("[host.reviews] load hotels failed", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hotelId == null) return;
    let active = true;
    getHotelReviews(hotelId)
      .then((r) => active && setReviews(r))
      .catch((err) => console.error("[host.reviews] load reviews failed", err));
    return () => {
      active = false;
    };
  }, [hotelId]);

  const hotel = hotels.find((h) => h.id === hotelId) ?? null;
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "-";

  async function submitReply(id: number) {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const updated = await replyToReview(id, replyText.trim());
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: updated.reply } : r)));
      setReplyTo(null);
      setReplyText("");
    } catch (err) {
      alert(translateApiError(err, t));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> {t("hr.loading")}
      </div>
    );
  }
  if (!hotel) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
        {t("hr.noHotel")}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{t("hr.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("hr.subtitle", { name: hotel.name })}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card px-5 py-3 text-center">
          <div className="inline-flex items-center gap-1.5 font-display text-2xl font-extrabold">
            <Star className="h-5 w-5 fill-warning text-warning" /> {avg}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("hr.reviewsCount", { n: reviews.length })}
          </div>
        </div>
      </div>

      {hotels.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hotels.map((h) => (
            <button
              key={h.id}
              onClick={() => setHotelId(h.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                h.id === hotelId
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("hr.empty")}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((rv) => (
            <div key={rv.id} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                    {String(rv.user_id)}
                  </div>
                  <div>
                    <div className="font-semibold">{t("hb.guestN", { id: rv.user_id })}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(rv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rv.rating ? "fill-warning text-warning" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{rv.comment}</p>

              {rv.reply ? (
                <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                  <div className="text-xs font-semibold text-muted-foreground">
                    {t("hr.yourReply")}
                  </div>
                  <div className="mt-1">{rv.reply}</div>
                </div>
              ) : replyTo === rv.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    rows={2}
                    placeholder={t("hr.replyPlaceholder")}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={() => submitReply(rv.id)}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("hr.send")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText("");
                      }}
                    >
                      {t("hr.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1"
                  onClick={() => {
                    setReplyTo(rv.id);
                    setReplyText("");
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> {t("hr.reply")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
