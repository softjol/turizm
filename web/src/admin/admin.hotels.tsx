import { useEffect, useState } from "react";
import { Eye, Check, X, EyeOff, Loader2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { searchHotels, moderateHotel, deleteHotel, type Hotel, type HotelStatus } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function AdminHotels() {
  const { t } = useI18n();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    searchHotels()
      .then(setHotels)
      .catch((err) => console.error("[admin.hotels] load failed", err))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: number, status: HotelStatus) {
    setBusy(id);
    try {
      const updated = await moderateHotel(id, status);
      setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, status: updated.status } : h)));
    } catch (err) {
      console.error("[admin.hotels] moderate failed", err);
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number, name: string) {
    if (!window.confirm(t("ho.deleteConfirm", { name }))) return;
    setBusy(id);
    try {
      await deleteHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("[admin.hotels] delete failed", err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navHotels")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.hotelsSubtitle")}</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {hotels.map((e) => {
            const cover = e.images.find((i) => i.is_main)?.url ?? e.images[0]?.url;
            return (
              <div
                key={e.id}
                className="grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[140px_1fr_auto]"
              >
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="h-24 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                    {t("ho.noPhoto")}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.status === "approved" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                    >
                      {e.status === "approved" ? t("status.approved") : t("status.pending")}
                    </span>
                    {e.hotel_type && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                        {e.hotel_type.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-display text-lg font-bold">{e.name}</div>
                  <div className="text-sm text-muted-foreground">{e.address}</div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button asChild size="sm" variant="outline" className="h-8 gap-1">
                    <Link to={`/estates/${e.id}`}>
                      <Eye className="h-3.5 w-3.5" /> {t("ho.view")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy === e.id}
                    onClick={() => setStatus(e.id, "approved")}
                    className="h-8 gap-1 bg-success text-success-foreground hover:bg-success/90"
                  >
                    <Check className="h-3.5 w-3.5" /> {t("ad.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === e.id}
                    onClick={() => setStatus(e.id, "pending")}
                    className="h-8 gap-1"
                  >
                    <EyeOff className="h-3.5 w-3.5" /> {t("ad.hide")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === e.id}
                    onClick={() => setStatus(e.id, "blocked")}
                    className="h-8 gap-1 text-destructive"
                  >
                    <X className="h-3.5 w-3.5" /> {t("ad.block")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === e.id}
                    onClick={() => remove(e.id, e.name)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
