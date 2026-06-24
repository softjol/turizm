import { Star, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    author: "Бакыт",
    hotel: "Капсула «Булан»",
    rating: 5,
    date: "12 мая 2026",
    text: "Невероятное место, хозяева очень внимательные.",
  },
  {
    author: "Айдай",
    hotel: "Капсула «Булан»",
    rating: 5,
    date: "3 мая 2026",
    text: "Чисто, уютно, тепло даже ночью.",
  },
  {
    author: "Аноним",
    hotel: "Хостел «Алтын»",
    rating: 1,
    date: "1 июн 2026",
    text: "Реклама услуг!!! Заходите на сайт...",
  },
  {
    author: "Анна",
    hotel: "Гостевой дом «Чолпон»",
    rating: 4,
    date: "15 апр 2026",
    text: "Хорошее соотношение цены и качества.",
  },
];

export default function AdminReviews() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Отзывы и рейтинги</h1>
      <p className="mt-1 text-muted-foreground">Модерация отзывов на платформе</p>

      <div className="mt-6 space-y-4">
        {reviews.map((rv, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                  {rv.author[0]}
                </div>
                <div>
                  <div className="font-semibold">{rv.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {rv.hotel} · {rv.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < rv.rating ? "fill-warning text-warning" : "text-muted"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{rv.text}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Удалить отзыв
              </Button>
              <Button size="sm" variant="ghost" className="gap-1">
                <Ban className="h-3.5 w-3.5" /> Заблокировать автора
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
