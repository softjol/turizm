import { useEffect, useMemo, useState } from "react";
import { translateApiError } from "@/lib/apiError";
import { Check, X, LogIn, LogOut, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listReceptionHotels,
  listHotelBookings,
  getHotelRooms,
  createWalkInBooking,
  confirmBooking,
  rejectBooking,
  checkInBooking,
  checkOutBooking,
  type Hotel,
  type RoomResponse,
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
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomsByHotel, setRoomsByHotel] = useState<Record<number, RoomResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("new");
  const [busy, setBusy] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const myHotels = await listReceptionHotels();
        const all: Row[] = [];
        const roomsMap: Record<number, RoomResponse[]> = {};
        for (const h of myHotels) {
          const [rooms, bookings] = await Promise.all([
            getHotelRooms(h.id).catch(() => []),
            listHotelBookings(h.id).catch(() => []),
          ]);
          roomsMap[h.id] = rooms;
          const roomName = new Map(rooms.map((r) => [r.id, r.name]));
          for (const b of bookings) {
            all.push({
              ...b,
              hotelName: h.name,
              roomName: roomName.get(b.room_id) ?? `#${b.room_id}`,
            });
          }
        }
        if (active) {
          setHotels(myHotels);
          setRoomsByHotel(roomsMap);
          setRows(all);
        }
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

  function handleCreated(hotelId: number, created: BookingResponse[]) {
    const hotel = hotels.find((h) => h.id === hotelId);
    const roomName = new Map((roomsByHotel[hotelId] ?? []).map((r) => [r.id, r.name]));
    const newRows: Row[] = created.map((booking) => ({
      ...booking,
      hotelName: hotel?.name ?? `#${hotelId}`,
      roomName: roomName.get(booking.room_id) ?? `#${booking.room_id}`,
    }));
    setRows((prev) => [...newRows, ...prev]);
    setShowCreate(false);
  }

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
      alert(translateApiError(err, t));
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{t("hb.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("hb.subtitle")}</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          disabled={hotels.length === 0}
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" /> {t("hb.newBooking")}
        </Button>
      </div>

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
                    {r.guest_name ?? t("hb.guestN", { id: r.user_id ?? r.id })}
                    {r.guest_phone && (
                      <div className="text-xs font-normal text-muted-foreground">
                        {r.guest_phone}
                      </div>
                    )}
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

      <CreateWalkInDialog
        open={showCreate}
        hotels={hotels}
        roomsByHotel={roomsByHotel}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

function CreateWalkInDialog({
  open,
  hotels,
  roomsByHotel,
  onClose,
  onCreated,
}: {
  open: boolean;
  hotels: Hotel[];
  roomsByHotel: Record<number, RoomResponse[]>;
  onClose: () => void;
  onCreated: (hotelId: number, bookings: BookingResponse[]) => void;
}) {
  const { t } = useI18n();
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [roomIds, setRoomIds] = useState<number[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guests, setGuests] = useState("1");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInNow, setCheckInNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setHotelId(hotels[0]?.id ?? null);
      setRoomIds([]);
      setDateFrom("");
      setDateTo("");
      setGuests("1");
      setGuestName("");
      setGuestPhone("");
      setCheckInNow(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const rooms = hotelId ? (roomsByHotel[hotelId] ?? []) : [];

  function toggleRoom(roomId: number) {
    setRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
    );
  }

  function describeError(err: unknown): string {
    return translateApiError(err, t, "hb.createError");
  }

  async function handleSubmit() {
    setError(null);
    if (!hotelId || roomIds.length === 0) {
      setError(t("hb.errRoom"));
      return;
    }
    if (!dateFrom || !dateTo || dateFrom >= dateTo) {
      setError(t("hb.errDates"));
      return;
    }
    if (guestName.trim().length < 2) {
      setError(t("hb.errGuestName"));
      return;
    }
    setSubmitting(true);
    try {
      const bookings = await createWalkInBooking(hotelId, {
        room_ids: roomIds,
        date_from: dateFrom,
        date_to: dateTo,
        guests: Number(guests) || 1,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim() || null,
        check_in_now: checkInNow,
      });
      onCreated(hotelId, bookings);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("hb.newBookingTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("hb.newBookingHint")}</p>
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {hotels.length > 1 && (
            <label className="block">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hb.hotel")}
              </div>
              <select
                value={hotelId ?? ""}
                onChange={(e) => {
                  setHotelId(Number(e.target.value));
                  setRoomIds([]);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("hb.rooms")}
            </div>
            <p className="mb-2 text-xs text-muted-foreground">{t("hb.roomsHint")}</p>
            {rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("hb.selectRoom")}</p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-input p-2">
                {rooms.map((r) => (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={roomIds.includes(r.id)}
                      onCheckedChange={() => toggleRoom(r.id)}
                    />
                    {r.name} ({r.room_number})
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hb.dateFrom")}
              </div>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label className="block">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("hb.dateTo")}
              </div>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
          </div>

          <label className="block">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("hb.guests")}
            </div>
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("hb.guestName")}
            </div>
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("hb.guestPhone")}
            </div>
            <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={checkInNow}
              onChange={(e) => setCheckInNow(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            {t("hb.checkInNow")}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t("ho.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("hb.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
