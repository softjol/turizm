import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial = [
  "Wi-Fi",
  "Парковка",
  "Кондиционер",
  "Бассейн",
  "Ресторан",
  "Баня",
  "Трансфер",
  "Детская площадка",
];

export default function AdminAmenities() {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Удобства</h1>
      <p className="mt-1 text-muted-foreground">Справочник удобств для объектов и комнат</p>

      <div className="mt-6 flex max-w-md gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новое удобство"
        />
        <Button
          onClick={() => {
            if (!name.trim()) return;
            setItems((s) => [...s, name.trim()]);
            setName("");
          }}
          className="gap-1 rounded-xl"
        >
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-5 py-4"
          >
            <span className="font-medium">{a}</span>
            <div className="flex gap-1.5">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:border-primary"
                aria-label="Редактировать"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive"
                aria-label="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
