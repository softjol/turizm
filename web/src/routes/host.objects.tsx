import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Eye, Loader2 } from "lucide-react";
import { getMyHotels, type Hotel } from "@/lib/api";

const STATUS_LABEL: Record<Hotel["status"], string> = {
  pending: "На модерации",
  approved: "Опубликовано",
};

const STATUS_CLASS: Record<Hotel["status"], string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
};

export default function HostObjects() {
  const [objects, setObjects] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyHotels()
      .then((hotels) => {
        if (active) setObjects(hotels);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Мои объекты</h1>
          <p className="mt-1 text-muted-foreground">Управляйте вашими размещениями</p>
        </div>
        <Link
          to="/host/objects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          <Plus className="h-4 w-4" /> Добавить объект
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Загрузка…
        </div>
      ) : objects.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center">
          <div className="font-display text-lg font-bold">Пока нет объектов</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Создайте первый объект — он появится здесь сразу после публикации.
          </p>
          <Link
            to="/host/objects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)]"
          >
            <Plus className="h-4 w-4" /> Добавить объект
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {objects.map((e) => {
            const cover = e.images.find((img) => img.is_main)?.url ?? e.images[0]?.url;
            return (
              <div
                key={e.id}
                className="grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[160px_1fr_auto]"
              >
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="h-28 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                    Нет фото
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[e.status]}`}
                    >
                      {STATUS_LABEL[e.status]}
                    </span>
                    {e.hotel_type && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                        {e.hotel_type.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-display text-lg font-bold">{e.name}</div>
                  <div className="text-sm text-muted-foreground">{e.address}</div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>⭐ {e.rating}</span>
                    <span>Заезд {e.check_in_time}</span>
                    <span>Выезд {e.check_out_time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                    aria-label="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                    aria-label="Редактировать"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive"
                    aria-label="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
