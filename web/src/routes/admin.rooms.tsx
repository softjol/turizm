import { Eye, Edit2, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estates } from "@/lib/mock-data";

const rooms = estates.flatMap((e) =>
  e.rooms.map((r) => ({
    name: r.name,
    hotel: e.name,
    type: r.type,
    capacity: r.capacity,
    price: r.price,
  })),
);

export default function AdminRooms() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Комнаты</h1>
      <p className="mt-1 text-muted-foreground">Все комнаты на платформе</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Комната</th>
              <th className="px-5 py-3">Гостиница</th>
              <th className="px-5 py-3">Тип</th>
              <th className="px-5 py-3">Мест</th>
              <th className="px-5 py-3">Цена</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rooms.map((r, i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td className="px-5 py-4 font-semibold">{r.name}</td>
                <td className="px-5 py-4">{r.hotel}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    {r.type}
                  </span>
                </td>
                <td className="px-5 py-4">{r.capacity}</td>
                <td className="px-5 py-4 font-semibold">{r.price.toLocaleString("ru-RU")} сом</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" /> Занятость
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Ban className="h-4 w-4" />
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
