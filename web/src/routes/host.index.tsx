import { Link } from "react-router-dom";
import { Home, Calendar, Wallet, Star, TrendingUp, ArrowRight } from "lucide-react";

const stats = [
  { label: "Объектов", value: "3", icon: Home, trend: "+1 в этом месяце" },
  { label: "Активных броней", value: "12", icon: Calendar, trend: "+4 за неделю" },
  { label: "Доход за месяц", value: "184 500 сом", icon: Wallet, trend: "+18%" },
  { label: "Средний рейтинг", value: "4.8", icon: Star, trend: "из 5.0" },
];

export default function HostDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Добро пожаловать, Айгуль 👋</h1>
          <p className="mt-1 text-muted-foreground">Краткий обзор ваших объектов и броней</p>
        </div>
        <Link
          to="/host/objects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          Добавить объект <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-success">
                <TrendingUp className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-4 font-display text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Последние брони</h2>
            <Link
              to="/host/bookings"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Все
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border/60">
            {[
              {
                g: "Бакыт Орозов",
                r: "Капсула 4 гостя",
                d: "10–14 июля",
                s: "Новая",
                color: "bg-primary/10 text-primary",
              },
              {
                g: "Анна Иванова",
                r: "Люкс с видом",
                d: "15–17 июля",
                s: "Подтверждена",
                color: "bg-success/15 text-success",
              },
              {
                g: "Тилек Касымов",
                r: "Капсула 4 гостя",
                d: "20–22 июля",
                s: "Заселён",
                color: "bg-accent text-accent-foreground",
              },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-semibold">{b.g}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.r} · {b.d}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${b.color}`}>
                  {b.s}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">Занятость</h2>
          <div className="mt-4">
            <div className="font-display text-4xl font-extrabold">72%</div>
            <div className="text-sm text-muted-foreground">в этом месяце</div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: "72%" }} />
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <Row label="🟢 Свободно" value="8 дней" />
            <Row label="🟡 Бронь" value="14 дней" />
            <Row label="🔴 Заселены" value="8 дней" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
