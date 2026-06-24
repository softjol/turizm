import { useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const statuses = [
  "Все",
  "Ожидает оплаты",
  "Ожидает подтверждения",
  "Подтверждено",
  "Заселен",
  "Завершено",
  "Отменено",
] as const;

const statusColor: Record<string, string> = {
  "Ожидает оплаты": "bg-muted text-muted-foreground",
  "Ожидает подтверждения": "bg-warning/15 text-warning-foreground",
  Подтверждено: "bg-success/15 text-success",
  Заселен: "bg-accent text-accent-foreground",
  Завершено: "bg-primary/10 text-primary",
  Отменено: "bg-destructive/15 text-destructive",
};

const rows = [
  {
    id: "B-1042",
    guest: "Бакыт Орозов",
    hotel: "Капсула «Булан»",
    dates: "10–14 июля",
    total: "18 000 сом",
    status: "Подтверждено",
  },
  {
    id: "B-1043",
    guest: "Анна Иванова",
    hotel: "Гостевой дом «Чолпон»",
    dates: "15–17 июля",
    total: "9 000 сом",
    status: "Ожидает оплаты",
  },
  {
    id: "B-1044",
    guest: "Тилек Касымов",
    hotel: "Отель «Сары-Жаз»",
    dates: "20–22 июля",
    total: "11 600 сом",
    status: "Ожидает подтверждения",
  },
  {
    id: "B-1045",
    guest: "Мирлан Сапаров",
    hotel: "Коттедж «Жети-Огуз»",
    dates: "1–5 авг",
    total: "28 800 сом",
    status: "Заселен",
  },
  {
    id: "B-1046",
    guest: "Дима Петров",
    hotel: "Хостел «Алтын»",
    dates: "3–4 июля",
    total: "700 сом",
    status: "Завершено",
  },
  {
    id: "B-1047",
    guest: "Айдай Калыева",
    hotel: "Капсула «Булан»",
    dates: "8–9 июля",
    total: "6 800 сом",
    status: "Отменено",
  },
];

export default function AdminBookings() {
  const [filter, setFilter] = useState<(typeof statuses)[number]>("Все");
  const list = filter === "Все" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Бронирования</h1>
      <p className="mt-1 text-muted-foreground">Все бронирования платформы</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">№</th>
              <th className="px-5 py-3">Гость</th>
              <th className="px-5 py-3">Гостиница</th>
              <th className="px-5 py-3">Даты</th>
              <th className="px-5 py-3">Сумма</th>
              <th className="px-5 py-3">Статус</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-5 py-4 font-mono text-xs">{r.id}</td>
                <td className="px-5 py-4 font-semibold">{r.guest}</td>
                <td className="px-5 py-4">{r.hotel}</td>
                <td className="px-5 py-4">{r.dates}</td>
                <td className="px-5 py-4 font-semibold">{r.total}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" /> Детали
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive">
                      <X className="h-3.5 w-3.5" /> Отменить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
