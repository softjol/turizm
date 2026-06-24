import { useState } from "react";
import { Plus, Edit2, Trash2, X, ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { estates } from "@/lib/mock-data";

const roomTypes = ["Стандарт", "Полулюкс", "Люкс", "Семейная", "Общая (для хостелов)"];

const roomAmenities = [
  "Wi-Fi",
  "Телевизор",
  "Кондиционер",
  "Душ",
  "Балкон",
  "Холодильник",
  "Кухня",
];

export default function HostRooms() {
  const rooms = estates[0].rooms;
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Комнаты</h1>
          <p className="mt-1 text-muted-foreground">Управляйте номерами вашего объекта</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Добавить комнату
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {rooms.map((r) => (
          <div
            key={r.id}
            className="grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[160px_1fr_auto]"
          >
            <img
              src={r.image}
              alt=""
              loading="lazy"
              className="h-28 w-full rounded-xl object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                  {r.type}
                </span>
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  Доступна
                </span>
              </div>
              <div className="mt-2 font-display text-lg font-bold">{r.name}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span>👤 до {r.capacity} гостей</span>
                <span>{r.price.toLocaleString("ru-RU")} сом / сутки</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
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
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">Добавление комнаты</h2>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Номер комнаты">
                <Input placeholder="101" />
              </Field>
              <Field label="Название комнаты">
                <Input placeholder="Двухместный с балконом" />
              </Field>
              <Field label="Тип комнаты">
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {roomTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Цена за сутки (сом)">
                <Input type="number" placeholder="3500" />
              </Field>
              <Field label="Количество взрослых">
                <Input type="number" defaultValue="2" min={1} />
              </Field>
              <Field label="Количество детей">
                <Input type="number" defaultValue="0" min={0} />
              </Field>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Удобства комнаты
              </div>
              <div className="flex flex-wrap gap-2">
                {roomAmenities.map((a) => {
                  const active = selected.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() =>
                        setSelected((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]))
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <Field label="Описание">
                <Textarea rows={4} placeholder="Опишите комнату" />
              </Field>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Фотографии комнаты (от 1 до 10)
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface p-8 transition hover:border-primary hover:bg-accent/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Upload className="h-4 w-4" /> Загрузить фото
                </span>
                <input type="file" multiple accept="image/*" className="hidden" />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-2 border-t border-border/70 pt-5">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Отмена
              </Button>
              <Button onClick={() => setShowForm(false)} className="rounded-xl">
                Сохранить комнату
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}
