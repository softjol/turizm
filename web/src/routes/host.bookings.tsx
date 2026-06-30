import { useEffect, useMemo, useState } from "react";
import { Check, X, LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listReceptionHotels,
  listHotelBookings,
  getHotelRooms,
  confirmBooking,
  rejectBooking,
  checkInBooking,
  checkOutBooking,
  type BookingResponse,
  type BookingStatus,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";

interface Row extends BookingResponse {
  roomName: string;
  hotelName: string;
}

type TabKey = "new" | "confirmed" | "checkedIn" | "completed" | "cancelled";

const TAB_STATUSES: Record<TabKey, BookingStatus[]> = {
  new: ["pending"],
  confirmed: ["confirmed"],
  checkedIn: ["checked_in"],
  completed: ["completed", "checked_out"],
  cancelled: ["cancelled", "rejected"],
};

export default function HostBookings() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("new");
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const hotels = await listReceptionHotels();
        const all: Row[] = [];
        for (const h of hotels) {
          const [rooms, bookings] = await Promise.all([
            getHotelRooms(h.id).catch(() => []),
            listHotelBookings(h.id).catch(() => []),
          ]);
          const roomName = new Map(rooms.map((r) => [r.id, r.name]));
          for (const b of bookings) {
            all.push({
              ...b,
              hotelName: h.name,
              roomName: roomName.get(b.room_id) ?? `#${b.room_id}`,
            });
          }
        }
        if (active) setRows(all);
      } catch (err) {
        console.error("[host.bookings] load failed", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const tabs: TabKey[] = ["new", "confirmed", "checkedIn", "completed", "cancelled"];
  const TAB_LABEL: Record<TabKey, string> = {
    new: t("hb.tabNew"),
    confirmed: t("hb.tabConfirmed"),
    checkedIn: t("hb.tabCheckedIn"),
    completed: t("hb.tabCompleted"),
    cancelled: t("hb.tabCancelled"),
  };

  const visible = useMemo(
    () => rows.filter((r) => TAB_STATUSES[tab].includes(r.status)),
    [rows, tab],
  );

  async function act(id: number, fn: (id: number) => Promise<BookingResponse>) {
    setBusy(id);
    try {
      const updated = await fn(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error).message;
      alert(detail);
    } finally {
      setBusy(null);
    }
  }

  function actionsFor(r: Row) {
    if (r.status === "pending")
      return (
        <>
          <Button
            size="sm"
            disabled={busy === r.id}
            className="h-8 gap-1 bg-success text-success-foreground hover:bg-success/90"
            onClick={() => act(r.id, confirmBooking)}
          >
            <Check className="h-3.5 w-3.5" /> {t("hb.confirm")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy === r.id}
            className="h-8 gap-1 text-destructive hover:text-destructive"
            onClick={() => act(r.id, rejectBooking)}
          >
            <X className="h-3.5 w-3.5" /> {t("hb.reject")}
          </Button>
        </>
      );
    if (r.status === "confirmed")
      return (
        <Button
          size="sm"
          disabled={busy === r.id}
          className="h-8 gap-1"
          onClick={() => act(r.id, checkInBooking)}
        >
          <LogIn className="h-3.5 w-3.5" /> {t("hb.checkIn")}
        </Button>
      );
    if (r.status === "checked_in")
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={busy === r.id}
          className="h-8 gap-1"
          onClick={() => act(r.id, checkOutBooking)}
        >
          <LogOut className="h-3.5 w-3.5" /> {t("hb.checkOut")}
        </Button>
      );
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("hb.title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("hb.subtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {tabs.map((tk) => {
          const count = rows.filter((r) => TAB_STATUSES[tk].includes(r.status)).length;
          return (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === tk
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {TAB_LABEL[tk]} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("hb.loading")}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("hb.empty")}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-left">
              <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">{t("hb.guest")}</th>
                <th className="px-5 py-3">{t("hb.hotel")}</th>
                <th className="px-5 py-3">{t("hb.room")}</th>
                <th className="px-5 py-3">{t("hb.dates")}</th>
                <th className="px-5 py-3">{t("hb.total")}</th>
                <th className="px-5 py-3 text-right">{t("hb.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold">
                    {t("hb.guestN", { id: r.user_id })}
                  </td>
                  <td className="px-5 py-4">{r.hotelName}</td>
                  <td className="px-5 py-4">{r.roomName}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {r.date_from} – {r.date_to}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold">
                    {Number(r.total_amount).toLocaleString("ru-RU")} {t("common.kgs")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">{actionsFor(r)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
