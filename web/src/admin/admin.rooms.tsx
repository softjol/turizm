import { useEffect, useState } from "react";
import { Eye, Edit2, Trash2, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchHotels, getHotelRooms } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

interface Row {
  id: number;
  name: string;
  hotel: string;
  type: string;
  capacity: number;
  price: number;
}

export default function AdminRooms() {
  const { t } = useI18n();
  const [rooms, setRooms] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const hotels = await searchHotels();
        const all: Row[] = [];
        for (const h of hotels) {
          const rs = await getHotelRooms(h.id).catch(() => []);
          for (const r of rs)
            all.push({
              id: r.id,
              name: r.name,
              hotel: h.name,
              type: r.type,
              capacity: r.capacity_adults + r.capacity_children,
              price: Number(r.price_per_night),
            });
        }
        setRooms(all);
      } catch (err) {
        console.error("[admin.rooms] load failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navRooms")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.roomsSubtitle")}</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : rooms.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("hrm.empty")}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-180 text-sm">
            <thead className="bg-surface text-left">
              <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">{t("hb.room")}</th>
                <th className="px-5 py-3">{t("hb.hotel")}</th>
                <th className="px-5 py-3">{t("hrm.type")}</th>
                <th className="px-5 py-3">{t("ad.colSeats")}</th>
                <th className="px-5 py-3">{t("ad.colPrice")}</th>
                <th className="px-5 py-3 text-right">{t("hb.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rooms.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-4 font-semibold">{r.name}</td>
                  <td className="px-5 py-4">{r.hotel}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">{r.capacity}</td>
                  <td className="px-5 py-4 font-semibold">
                    {r.price.toLocaleString("ru-RU")} {t("common.kgs")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8 gap-1">
                        <Eye className="h-3.5 w-3.5" /> {t("hi.occupancy")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
