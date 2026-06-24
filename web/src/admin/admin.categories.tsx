import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial = [
  { name: "Гостиница", icon: "🏨", count: 12 },
  { name: "Отель", icon: "🛎️", count: 8 },
  { name: "Хостел", icon: "🛏️", count: 5 },
  { name: "Коттедж", icon: "🏘️", count: 9 },
  { name: "Гостевой дом", icon: "🏡", count: 8 },
];

export default function AdminCategories() {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Категории жилья</h1>
      <p className="mt-1 text-muted-foreground">Справочник типов объектов размещения</p>

      <div className="mt-6 flex max-w-md gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новая категория"
        />
        <Button
          onClick={() => {
            if (!name.trim()) return;
            setItems((s) => [...s, { name: name.trim(), icon: "🏠", count: 0 }]);
            setName("");
          }}
          className="gap-1 rounded-xl"
        >
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <span className="text-3xl">{c.icon}</span>
            <div className="flex-1">
              <div className="font-display text-lg font-bold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.count} объектов</div>
            </div>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
              aria-label="Редактировать"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
