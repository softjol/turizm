import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Calendar, Bed, Users, Star, Loader2, ArrowRight } from "lucide-react";
import {
  listReceptionHotels,
  getReceptionDashboard,
  type BookingResponse,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

interface Agg {
  hotels: number;
  totalRooms: number;
  freeRooms: number;
  occupiedRooms: number;
  bookings: number;
  guests: number;
  rating: number;
  recent: BookingResponse[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "mb.statusPending",
  confirmed: "mb.statusConfirmed",
  checked_in: "mb.statusCheckedIn",
  checked_out: "mb.statusCompleted",
  completed: "mb.statusCompleted",
  cancelled: "mb.statusCancelled",
  rejected: "mb.statusRejected",
};

export default function HostDashboard() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [agg, setAgg] = useState<Agg | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    (async () => {
      try {
        const hotels = await listReceptionHotels();
        const dashboards = await Promise.all(
          hotels.map((h) => getReceptionDashboard(h.id, today).catch(() => null)),
        );
        const ok = dashboards.filter((d): d is NonNullable<typeof d> => d !== null);
        const sum = (f: (d: (typeof ok)[number]) => number) => ok.reduce((a, d) => a + f(d), 0);
        setAgg({
          hotels: hotels.length,
          totalRooms: sum((d) => d.total_rooms),
          freeRooms: sum((d) => d.free_rooms),
          occupiedRooms: sum((d) => d.occupied_rooms),
          bookings: sum((d) => d.bookings_count),
          guests: sum((d) => d.guests_count),
          rating: ok.length ? sum((d) => d.average_rating) / ok.length : 0,
          recent: ok
            .flatMap((d) => d.recent_bookings)
            .sort((a, b) => b.id - a.id)
            .slice(0, 5),
        });
      } catch (err) {
        console.error("[host.index] load failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", {
      day: "numeric",
      month: "short",
    });

  const occupancy =
    agg && agg.totalRooms > 0 ? Math.round((agg.occupiedRooms / agg.totalRooms) * 100) : 0;

  const stats = agg
    ? [
        { label: t("hi.objects"), value: String(agg.hotels), icon: Home },
        { label: t("hrm.title"), value: String(agg.totalRooms), icon: Bed },
        { label: t("hi.activeBookings"), value: String(agg.bookings), icon: Calendar },
        { label: t("search.guests"), value: String(agg.guests), icon: Users },
        { label: t("hi.avgRating"), value: agg.rating.toFixed(1), icon: Star },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            {t("hi.welcome", { name: user?.name ?? "" })} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">{t("hi.subtitle")}</p>
        </div>
        <Link
          to="/host/objects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          {t("ho.add")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="mt-4 font-display text-2xl font-extrabold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{t("hi.recentBookings")}</h2>
                <Link to="/host/bookings" className="text-sm font-semibold text-primary hover:underline">
                  {t("popular.all")}
                </Link>
              </div>
              <div className="mt-4 divide-y divide-border/60">
                {agg?.recent.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {t("ad.bookingsEmpty")}
                  </div>
                )}
                {agg?.recent.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold">
                        {b.guest_name ?? t("hb.guestN", { id: b.user_id ?? b.id })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmt(b.date_from)} → {fmt(b.date_to)}
                      </div>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                      {t(STATUS_LABEL[b.status] ?? "mb.statusPending")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="font-display text-lg font-bold">{t("hi.occupancy")}</h2>
              <div className="mt-4">
                <div className="font-display text-4xl font-extrabold">{occupancy}%</div>
                <div className="text-sm text-muted-foreground">{t("hi.thisMonth")}</div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${occupancy}%` }} />
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <Row label={`🟢 ${t("hi.free")}`} value={String(agg?.freeRooms ?? 0)} />
                <Row label={`🔴 ${t("hi.occupied")}`} value={String(agg?.occupiedRooms ?? 0)} />
              </div>
            </div>
          </div>
        </>
      )}
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
