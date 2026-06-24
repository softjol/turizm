import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, X, MessageCircle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  getMyBookings,
  cancelBooking,
  getRoom,
  getHotel,
  getAccessToken,
  type BookingResponse,
  type BookingStatus,
} from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

const tabKeys = [
  "mb.tabAll",
  "mb.tabPending",
  "mb.tabConfirmed",
  "mb.tabCompleted",
  "mb.tabCancelled",
] as const;

/** Which backend statuses each tab shows. */
const TAB_STATUSES: Record<(typeof tabKeys)[number], BookingStatus[] | null> = {
  "mb.tabAll": null,
  "mb.tabPending": ["pending"],
  "mb.tabConfirmed": ["confirmed", "checked_in"],
  "mb.tabCompleted": ["checked_out", "completed"],
  "mb.tabCancelled": ["cancelled", "rejected"],
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "mb.statusPending",
  confirmed: "mb.statusConfirmed",
  checked_in: "mb.statusCheckedIn",
  checked_out: "mb.statusCompleted",
  completed: "mb.statusCompleted",
  cancelled: "mb.statusCancelled",
  rejected: "mb.statusRejected",
};

const CANCELLABLE: BookingStatus[] = ["pending", "confirmed"];

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=400&q=80";

/** A booking enriched with its room + hotel display data. */
interface BookingView {
  booking: BookingResponse;
  estate: { id: number; name: string; address: string; cover: string };
  roomName: string;
}

async function enrichBooking(b: BookingResponse): Promise<BookingView> {
  const room = await getRoom(b.room_id);
  const hotel = await getHotel(room.hotel_id);
  const cover =
    hotel.images.find((i) => i.is_main)?.url ?? hotel.images[0]?.url ?? PLACEHOLDER_IMAGE;
  return {
    booking: b,
    estate: { id: hotel.id, name: hotel.name, address: hotel.address, cover },
    roomName: room.name,
  };
}

export default function BookingsPage() {
  const { t, td, lang } = useI18n();
  useDocumentTitle(t("mb.docTitle"));
  const [tab, setTab] = useState<(typeof tabKeys)[number]>("mb.tabAll");
  const [views, setViews] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed] = useState(() => Boolean(getAccessToken()));
  const [cancelling, setCancelling] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const bookings = await getMyBookings();
      const enriched = await Promise.all(bookings.map((b) => enrichBooking(b)));
      setViews(enriched);
    } catch (err) {
      console.error("[bookings] failed to load", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      return;
    }
    void load();
  }, [authed]);

  const filtered = useMemo(() => {
    const allowed = TAB_STATUSES[tab];
    if (!allowed) return views;
    return views.filter((v) => allowed.includes(v.booking.status));
  }, [views, tab]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", {
      day: "numeric",
      month: "long",
    });

  async function handleCancel(id: number) {
    setCancelling(id);
    try {
      await cancelBooking(id);
      await load();
    } catch (err) {
      console.error("[bookings] cancel failed", err);
    } finally {
      setCancelling(null);
    }
  }

  return (
    <AppShell>
      <div className="container-app py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t("mb.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("mb.subtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-3">
          {tabKeys.map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {!authed ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p>{t("mb.subtitle")}</p>
            <Button asChild className="mt-4">
              <Link to="/auth">{t("menu.login")}</Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {t("mb.title")} — 0
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map(({ booking: b, estate, roomName }) => {
              const total = Number(b.total_amount);
              const deposit = Number(b.deposit_amount);
              return (
                <div
                  key={b.id}
                  className="grid gap-5 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-[180px_1fr_auto]"
                >
                  <Link to={`/estates/${estate.id}`}>
                    <img
                      src={estate.cover}
                      alt=""
                      className="h-32 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          b.status === "confirmed" || b.status === "checked_in"
                            ? "bg-success/15 text-success"
                            : b.status === "cancelled" || b.status === "rejected"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-warning/20 text-warning-foreground"
                        }`}
                      >
                        {t(STATUS_LABEL[b.status])}
                      </span>
                    </div>
                    <Link
                      to={`/estates/${estate.id}`}
                      className="mt-2 block font-display text-xl font-bold hover:text-primary"
                    >
                      {td(estate.name)}
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {td(estate.address)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" /> {fmtDate(b.date_from)} →{" "}
                        {fmtDate(b.date_to)}
                      </span>
                      <span>{t("mb.guests", { n: b.guests })}</span>
                      <span>{td(roomName)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{t("mb.total")}</div>
                      <div className="font-display text-2xl font-extrabold">
                        {total.toLocaleString("ru-RU")} {t("common.kgs")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("mb.deposit", { d: deposit.toLocaleString("ru-RU") })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <MessageCircle className="h-4 w-4" /> {t("mb.chat")}
                      </Button>
                      {CANCELLABLE.includes(b.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          disabled={cancelling === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          {cancelling === b.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}{" "}
                          {t("mb.cancel")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
