import { useEffect, useState } from "react";
import { Users, Building2, Bed, Calendar, TrendingUp, Star } from "lucide-react";
import { getEstates } from "@/lib/api";
import type { Estate } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [popular, setPopular] = useState<Estate[]>([]);

  useEffect(() => {
    getEstates({ limit: 5 })
      .then(setPopular)
      .catch(() => setPopular([]));
  }, []);

  const stats = [
    { label: t("ad.statUsers"), value: "1 248", icon: Users, trend: "+12%" },
    { label: t("ad.statHotels"), value: "42", icon: Building2, trend: "+3" },
    { label: t("ad.statRooms"), value: "186", icon: Bed, trend: "" },
    { label: t("ad.statBookings"), value: "586", icon: Calendar, trend: "+24%" },
    { label: t("ad.statRating"), value: "4.7", icon: Star, trend: t("hi.outOf5") },
    {
      label: t("ad.statRevenue"),
      value: `428 500 ${t("common.kgs")}`,
      icon: TrendingUp,
      trend: t("hf.month"),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{t("ad.navDashboard")}</h1>
        <p className="mt-1 text-muted-foreground">{t("ad.dashSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <div className="mt-4 font-display text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            {s.trend && <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">{t("ad.popular")}</h2>
          <div className="mt-4 divide-y divide-border/60">
            {popular.map((e, i) => (
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
                <div className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {e.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">{t("ad.revenueByDay")}</h2>
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
        </div>
      </div>
    </div>
  );
}
