import { Search, Shield, Ban, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const users = [
  { name: "Айгуль Турсунова", phone: "+996 700 11 22 33", role: "Пользователь", status: "Активен" },
  { name: "Бакыт Орозов", phone: "+996 555 33 44 55", role: "Ресепшен", status: "Активен" },
  { name: "Нурлан Эшимов", phone: "+996 707 88 99 00", role: "Ресепшен", status: "Заблокирован" },
  { name: "Анна Иванова", phone: "+996 312 11 22 33", role: "Пользователь", status: "Активен" },
];

export default function AdminUsers() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Пользователи</h1>
      <p className="mt-1 text-muted-foreground">Управление учётными записями</p>

      <div className="mt-6 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск по имени или телефону" className="pl-9" />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Имя</th>
              <th className="px-5 py-3">Телефон</th>
              <th className="px-5 py-3">Роль</th>
              <th className="px-5 py-3">Статус</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td className="px-5 py-4 font-semibold">{u.name}</td>
                <td className="px-5 py-4">{u.phone}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.status === "Активен" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                      <Shield className="h-3.5 w-3.5" /> Роль
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                      <Ban className="h-3.5 w-3.5" /> Блок
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                      <Trash2 className="h-4 w-4" />
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
