import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type FilterKey =
  | "all"
  | "awaitingPayment"
  | "awaitingConfirm"
  | "confirmed"
  | "checkedIn"
  | "completed"
  | "cancelled";

const FILTER_KEYS: { key: FilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "ad.bkAll" },
  { key: "awaitingPayment", labelKey: "ad.bkAwaitingPayment" },
  { key: "awaitingConfirm", labelKey: "mb.statusPending" },
  { key: "confirmed", labelKey: "mb.statusConfirmed" },
  { key: "checkedIn", labelKey: "mb.statusCheckedIn" },
  { key: "completed", labelKey: "mb.statusCompleted" },
  { key: "cancelled", labelKey: "mb.statusCancelled" },
];

export default function AdminBookings() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterKey>("all");

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navBookings")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.bookingsSubtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {FILTER_KEYS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
        {t("ad.bookingsEmpty")}
      </div>
    </div>
  );
}
