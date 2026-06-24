import { Eye, Check, X, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estates } from "@/lib/mock-data";

export default function AdminHotels() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Гостиницы</h1>
      <p className="mt-1 text-muted-foreground">Модерация и управление объектами</p>

      <div className="mt-6 grid gap-4">
        {estates.map((e) => (
          <div
            key={e.id}
            className="grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[140px_1fr_auto]"
          >
            <img
              src={e.cover}
              alt=""
              loading="lazy"
              className="h-24 w-full rounded-xl object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  Опубликован
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                  {e.type}
                </span>
              </div>
              <div className="mt-2 font-display text-lg font-bold">{e.name}</div>
              <div className="text-sm text-muted-foreground">{e.address}</div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Eye className="h-3.5 w-3.5" /> Просмотр
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 bg-success text-success-foreground hover:bg-success/90"
              >
                <Check className="h-3.5 w-3.5" /> Одобрить
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <EyeOff className="h-3.5 w-3.5" /> Скрыть
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive">
                <X className="h-3.5 w-3.5" /> Блок
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
