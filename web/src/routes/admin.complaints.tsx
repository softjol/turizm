import { Eye, X, Building2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

const complaints = [
  {
    id: "C-12",
    from: "Анна Иванова",
    target: "Хостел «Алтын»",
    type: "Гостиница",
    reason: "Не соответствует фото",
    date: "2 июн 2026",
    status: "Новая",
  },
  {
    id: "C-13",
    from: "Тилек Касымов",
    target: "Отзыв «Аноним»",
    type: "Отзыв",
    reason: "Спам / реклама",
    date: "1 июн 2026",
    status: "Новая",
  },
  {
    id: "C-14",
    from: "Мирлан Сапаров",
    target: "Гостевой дом «Чолпон»",
    type: "Гостиница",
    reason: "Отказ в заселении",
    date: "28 мая 2026",
    status: "Рассмотрена",
  },
];

export default function AdminComplaints() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Жалобы</h1>
      <p className="mt-1 text-muted-foreground">Жалобы пользователей на гостиницы и отзывы</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">№</th>
              <th className="px-5 py-3">От кого</th>
              <th className="px-5 py-3">Объект</th>
              <th className="px-5 py-3">Причина</th>
              <th className="px-5 py-3">Дата</th>
              <th className="px-5 py-3">Статус</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-muted/40">
                <td className="px-5 py-4 font-mono text-xs">{c.id}</td>
                <td className="px-5 py-4 font-semibold">{c.from}</td>
                <td className="px-5 py-4">
                  {c.target}
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{c.type}</span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{c.reason}</td>
                <td className="px-5 py-4">{c.date}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      c.status === "Новая"
                        ? "bg-warning/15 text-warning-foreground"
                        : "bg-success/15 text-success"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" /> Рассмотреть
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                      <X className="h-3.5 w-3.5" /> Отклонить
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive">
                      <Building2 className="h-3.5 w-3.5" /> Блок гостиницы
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive">
                      <UserX className="h-3.5 w-3.5" /> Блок юзера
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
