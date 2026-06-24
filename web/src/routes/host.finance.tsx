import { Wallet, Calendar, PiggyBank, TrendingUp } from "lucide-react";

const periods = [
  { label: "Доход за день", value: "8 200 сом", icon: Wallet },
  { label: "Доход за неделю", value: "54 600 сом", icon: Wallet },
  { label: "Доход за месяц", value: "184 500 сом", icon: Wallet },
];

const extra = [
  { label: "Количество бронирований", value: "32", icon: Calendar },
  { label: "Полученные задатки", value: "55 350 сом", icon: PiggyBank },
];

export default function HostFinance() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Доходы</h1>
        <p className="mt-1 text-muted-foreground">Финансовая сводка по вашему объекту</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {periods.map((p) => (
          <div key={p.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center gap-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" /> Доход
            </div>
            <div className="mt-3 font-display text-2xl font-extrabold">{p.value}</div>
            <div className="text-sm text-muted-foreground">{p.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {extra.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <s.icon className="h-6 w-6" />
            </span>
            <div>
              <div className="font-display text-2xl font-extrabold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-display text-lg font-bold">Доход по неделям</h2>
        <div className="mt-6 flex h-40 items-end gap-3">
          {[55, 70, 48, 82, 90, 65, 88].map((h, i) => (
            <div key={i} className="flex-1">
              <div
                className="rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
