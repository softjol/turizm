import { useState } from "react";
import { Phone, MessageCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = ["Новые", "Подтверждённые", "Заселённые", "Завершённые", "Отменённые"] as const;

const rows = [
  {
    guest: "Бакыт Орозов",
    phone: "+996 700 11 22 33",
    room: "Капсула 4 гостя",
    dates: "10–14 июля",
    total: "18 000 сом",
    status: "Новая",
  },
  {
    guest: "Анна Иванова",
    phone: "+996 555 44 55 66",
    room: "Люкс с видом",
    dates: "15–17 июля",
    total: "13 600 сом",
    status: "Новая",
  },
  {
    guest: "Тилек Касымов",
    phone: "+996 700 77 88 99",
    room: "Капсула 4 гостя",
    dates: "20–22 июля",
    total: "9 000 сом",
    status: "Новая",
  },
];

export default function HostBookings() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Новые");
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Бронирования</h1>
      <p className="mt-1 text-muted-foreground">Управляйте заявками от гостей</p>

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

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Гость</th>
              <th className="px-5 py-3">Телефон</th>
              <th className="px-5 py-3">Комната</th>
              <th className="px-5 py-3">Даты</th>
              <th className="px-5 py-3">Сумма</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td className="px-5 py-4 font-semibold">{r.guest}</td>
                <td className="px-5 py-4">
                  <a
                    href={`tel:${r.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary"
                  >
                    <Phone className="h-3.5 w-3.5" /> {r.phone}
                  </a>
                </td>
                <td className="px-5 py-4">{r.room}</td>
                <td className="px-5 py-4">{r.dates}</td>
                <td className="px-5 py-4 font-semibold">{r.total}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-success text-success-foreground hover:bg-success/90"
                    >
                      <Check className="h-3.5 w-3.5" /> Подтвердить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-destructive hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" /> Отклонить
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <MessageCircle className="h-4 w-4" />
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
