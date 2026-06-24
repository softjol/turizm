import { Wallet, TrendingUp, PiggyBank, Percent, Receipt } from "lucide-react";

const periods = [
  { label: "За день", value: "12 800 сом" },
  { label: "За неделю", value: "96 400 сом" },
  { label: "За месяц", value: "428 500 сом" },
  { label: "За год", value: "4 920 000 сом" },
];

const stats = [
  { label: "Общая сумма бронирований", value: "5 340 000 сом", icon: Wallet },
  { label: "Полученные задатки", value: "1 602 000 сом", icon: PiggyBank },
  { label: "Комиссия платформы (10%)", value: "534 000 сом", icon: Percent },
  { label: "Количество транзакций", value: "1 286", icon: Receipt },
];

export default function AdminFinance() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Финансы</h1>
        <p className="mt-1 text-muted-foreground">Доходы платформы и статистика транзакций</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {periods.map((p) => (
          <div key={p.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center gap-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" /> Доход платформы
            </div>
            <div className="mt-3 font-display text-2xl font-extrabold">{p.value}</div>
            <div className="text-sm text-muted-foreground">{p.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <div className="mt-4 font-display text-xl font-extrabold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-display text-lg font-bold">Доходы по месяцам</h2>
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
          <span>Янв</span>
          <span>Дек</span>
        </div>
      </div>
    </div>
  );
}
