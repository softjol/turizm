import { useState } from "react";
import { ImageIcon, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const tabs = ["Информация", "Удобства", "Фотографии"] as const;

const hotelAmenities = [
  "Wi-Fi",
  "Парковка",
  "Кондиционер",
  "Бассейн",
  "Ресторан",
  "Трансфер",
  "Баня",
  "Детская площадка",
];

export default function HostSettings() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Информация");
  const [selected, setSelected] = useState<string[]>(["Wi-Fi", "Парковка", "Баня"]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold">Моя гостиница</h1>
      <p className="mt-1 text-muted-foreground">Настройки объекта «Капсула «Булан»»</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6">
        {tab === "Информация" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Название гостиницы">
              <Input defaultValue="Капсула «Булан»" />
            </Field>
            <Field label="Тип объекта">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Гостиница</option>
                <option>Отель</option>
                <option>Хостел</option>
                <option>Коттедж</option>
                <option>Гостевой дом</option>
              </select>
            </Field>
            <Field label="Адрес">
              <Input defaultValue="с. Булан-Соготту, Сары-Челек" />
            </Field>
            <Field label="Координаты на карте">
              <Input defaultValue="41.8500, 71.9500" />
            </Field>
            <Field label="Телефон">
              <Input defaultValue="+996 700 11 22 33" />
            </Field>
            <Field label="WhatsApp">
              <Input defaultValue="+996 700 11 22 33" />
            </Field>
            <Field label="Email">
              <Input defaultValue="bulan@example.com" />
            </Field>
            <div />
            <Field label="Время заезда">
              <Input type="time" defaultValue="14:00" />
            </Field>
            <Field label="Время выезда">
              <Input type="time" defaultValue="12:00" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Описание">
                <Textarea rows={4} defaultValue="Уютный современный коттедж в горах Сары-Челека." />
              </Field>
            </div>
          </div>
        )}

        {tab === "Удобства" && (
          <div className="flex flex-wrap gap-2">
            {hotelAmenities.map((a) => {
              const active = selected.includes(a);
              return (
                <button
                  key={a}
                  onClick={() =>
                    setSelected((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]))
                  }
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {active && <Check className="h-4 w-4" />} {a}
                </button>
              );
            })}
          </div>
        )}

        {tab === "Фотографии" && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface p-12 transition hover:border-primary hover:bg-accent/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </span>
            <span className="inline-flex items-center gap-2 font-semibold text-primary">
              <Upload className="h-4 w-4" /> Загрузить фотографии
            </span>
            <input type="file" multiple accept="image/*" className="hidden" />
          </label>
        )}
      </div>

      <Button size="lg" className="mt-6 rounded-xl">
        Сохранить
      </Button>
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
