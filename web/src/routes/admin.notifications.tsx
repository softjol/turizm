import { UserPlus, Building2, Flag, Calendar, XCircle } from "lucide-react";

const items = [
  {
    icon: UserPlus,
    text: "Новый ресепшен зарегистрировался: Нурлан Эшимов",
    time: "5 минут назад",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Building2,
    text: "Добавлена новая гостиница «Эдельвейс» — ожидает модерации",
    time: "1 час назад",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Flag,
    text: "Новая жалоба на Хостел «Алтын»",
    time: "3 часа назад",
    color: "bg-warning/15 text-warning-foreground",
  },
  {
    icon: Calendar,
    text: "Новое бронирование B-1044 в Отель «Сары-Жаз»",
    time: "вчера",
    color: "bg-success/15 text-success",
  },
  {
    icon: XCircle,
    text: "Отмена бронирования B-1047 (Капсула «Булан»)",
    time: "вчера",
    color: "bg-destructive/15 text-destructive",
  },
];

export default function AdminNotifications() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Уведомления</h1>
      <p className="mt-1 text-muted-foreground">События платформы</p>

      <div className="mt-6 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
        {items.map((n, i) => (
          <div key={i} className="flex items-center gap-4 p-5 hover:bg-muted/40">
            <span
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${n.color}`}
            >
              <n.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium">{n.text}</div>
              <div className="text-xs text-muted-foreground">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
