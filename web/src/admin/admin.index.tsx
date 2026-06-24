import { Users, Building2, Bed, Calendar, TrendingUp, Star } from "lucide-react";
import { estates } from "@/lib/mock-data";

const stats = [
  { label: "Пользователи", value: "1 248", icon: Users, trend: "+12% за месяц" },
  { label: "Гостиницы", value: "42", icon: Building2, trend: "+3 на модерации" },
  { label: "Комнаты", value: "186", icon: Bed, trend: "" },
  { label: "Бронирования", value: "586", icon: Calendar, trend: "+24% за неделю" },
  { label: "Средний рейтинг", value: "4.7", icon: Star, trend: "из 5.0" },
  { label: "Доход платформы", value: "428 500 сом", icon: TrendingUp, trend: "За месяц" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Сводка по всей платформе</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 font-display text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            {s.trend && <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">Популярные объекты</h2>
          <div className="mt-4 divide-y divide-border/60">
            {estates.slice(0, 5).map((e, i) => (
              <div key={e.id} className="flex items-center gap-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                  {i + 1}
                </span>
                <img src={e.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.type} · {e.address}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {e.rating}
                  </div>
                  <div className="text-xs text-muted-foreground">{e.reviewsCount} отзывов</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">Доход по дням</h2>
          <div className="mt-6 flex h-48 items-end gap-2">
            {[40, 62, 55, 78, 90, 72, 95, 110, 88, 102, 130, 118].map((h, i) => (
              <div key={i} className="flex-1">
                <div
                  className="rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>1 июня</span>
            <span>12 июня</span>
          </div>
        </div>
      </div>
    </div>
  );
}
