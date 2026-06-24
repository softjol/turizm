const days = Array.from({ length: 30 }, (_, i) => i + 1);
const statuses: ("free" | "booked" | "checked")[] = days.map((d) =>
  d % 7 === 0 ? "checked" : d % 3 === 0 ? "booked" : "free",
);

export default function HostCalendar() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Календарь занятости</h1>
      <p className="mt-1 text-muted-foreground">Июль 2026 · Капсула «Булан»</p>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Legend color="bg-success" label="Свободно" />
        <Legend color="bg-warning" label="Забронировано" />
        <Legend color="bg-destructive" label="Заселены" />
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 rounded-2xl border border-border/70 bg-card p-4">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const s = statuses[i];
          const color =
            s === "free"
              ? "bg-success/10 text-success border-success/30"
              : s === "booked"
                ? "bg-warning/15 text-warning-foreground border-warning/30"
                : "bg-destructive/10 text-destructive border-destructive/30";
          return (
            <div
              key={d}
              className={`flex aspect-square flex-col items-start justify-between rounded-xl border p-2 text-xs ${color}`}
            >
              <span className="font-bold text-foreground">{d}</span>
              <span className="text-[10px] uppercase">
                {s === "free" ? "🟢" : s === "booked" ? "🟡" : "🔴"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} /> {label}
    </div>
  );
}
