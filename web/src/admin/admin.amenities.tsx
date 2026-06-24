import { useEffect, useState } from "react";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { getAmenities, type AmenityResponse } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function AdminAmenities() {
  const { t } = useI18n();
  const [items, setItems] = useState<AmenityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAmenities()
      .then(setItems)
      .catch((err) => console.error("[admin.amenities] load failed", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navAmenities")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.amenitiesSubtitle")}</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-5 py-4"
            >
              <span className="font-medium">{a.name}</span>
              <div className="flex gap-1.5">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:border-primary"
                  aria-label={t("ho.edit")}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive"
                  aria-label={t("ho.delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
