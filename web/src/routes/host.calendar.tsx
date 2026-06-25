import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  listReceptionHotels,
  getHotelRooms,
  getRoomCalendar,
  type RoomCalendar,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const WEEKDAY_KEYS = ["hc.mon", "hc.tue", "hc.wed", "hc.thu", "hc.fri", "hc.sat", "hc.sun"];
const DAYS = 30;

interface RoomOpt {
  id: number;
  label: string;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function HostCalendar() {
  const { t } = useI18n();
  const [roomOpts, setRoomOpts] = useState<RoomOpt[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [cal, setCal] = useState<RoomCalendar | null>(null);
  const [loading, setLoading] = useState(true);

  const start = useMemo(() => new Date(), []);
  const days = useMemo(
    () =>
      Array.from({ length: DAYS }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      }),
    [start],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const hotels = await listReceptionHotels();
        const opts: RoomOpt[] = [];
        for (const h of hotels) {
          const rs = await getHotelRooms(h.id).catch(() => []);
          for (const r of rs) opts.push({ id: r.id, label: `${h.name} · ${r.name}` });
        }
        if (active) {
          setRoomOpts(opts);
          setRoomId(opts[0]?.id ?? null);
          if (opts.length === 0) setLoading(false);
        }
      } catch (err) {
        console.error("[host.calendar] load failed", err);
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (roomId === null) return;
    setLoading(true);
    const end = new Date(start);
    end.setDate(start.getDate() + DAYS);
    getRoomCalendar(roomId, iso(start), iso(end))
      .then(setCal)
      .catch((err) => console.error("[host.calendar] calendar failed", err))
      .finally(() => setLoading(false));
  }, [roomId, start]);

  const isBooked = (d: Date) => {
    if (!cal) return false;
    const day = iso(d);
    return cal.occupied_periods.some((p) => day >= p.date_from && day < p.date_to);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{t("hc.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("hc.subtitle")}</p>
        </div>
        {roomOpts.length > 0 && (
          <select
            value={roomId ?? undefined}
            onChange={(e) => setRoomId(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {roomOpts.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Legend color="bg-success" label={t("hc.free")} />
        <Legend color="bg-destructive" label={t("hc.occupied")} />
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : roomOpts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("hrm.empty")}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-7 gap-2 rounded-2xl border border-border/70 bg-card p-4">
          {WEEKDAY_KEYS.map((k) => (
            <div
              key={k}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t(k)}
            </div>
          ))}
          {days.map((d) => {
            const booked = isBooked(d);
            const color = booked
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "bg-success/10 text-success border-success/30";
            return (
              <div
                key={iso(d)}
                className={`flex aspect-square flex-col items-start justify-between rounded-xl border p-2 text-xs ${color}`}
              >
                <span className="font-bold text-foreground">{d.getDate()}</span>
                <span className="text-[10px]">{booked ? "🔴" : "🟢"}</span>
              </div>
            );
          })}
        </div>
      )}
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
