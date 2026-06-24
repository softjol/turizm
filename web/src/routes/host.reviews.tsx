import { useState } from "react";
import { Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { estates } from "@/lib/mock-data";

export default function HostReviews() {
  const estate = estates[0];
  const [replyTo, setReplyTo] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Отзывы</h1>
          <p className="mt-1 text-muted-foreground">Отзывы гостей о «{estate.name}»</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card px-5 py-3 text-center">
          <div className="inline-flex items-center gap-1.5 font-display text-2xl font-extrabold">
            <Star className="h-5 w-5 fill-warning text-warning" /> {estate.rating}
          </div>
          <div className="text-xs text-muted-foreground">{estate.reviewsCount} отзывов</div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {estate.reviews.map((rv) => (
          <div key={rv.id} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                  {rv.author[0]}
                </div>
                <div>
                  <div className="font-semibold">{rv.author}</div>
                  <div className="text-xs text-muted-foreground">{rv.date}</div>
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
            <p className="mt-3 text-sm leading-relaxed">{rv.text}</p>

            {rv.reply ? (
              <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                <div className="text-xs font-semibold text-muted-foreground">Ваш ответ:</div>
                <div className="mt-1">{rv.reply}</div>
              </div>
            ) : replyTo === rv.id ? (
              <div className="mt-3 space-y-2">
                <Textarea rows={2} placeholder="Напишите ответ гостю…" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setReplyTo(null)}>
                    Отправить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 gap-1"
                onClick={() => setReplyTo(rv.id)}
              >
                <MessageCircle className="h-3.5 w-3.5" /> Ответить
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
