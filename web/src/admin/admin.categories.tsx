import { useEffect, useState } from "react";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { getHotelTypes, type HotelTypeResponse } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function AdminCategories() {
  const { t } = useI18n();
  const [items, setItems] = useState<HotelTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotelTypes()
      .then(setItems)
      .catch((err) => console.error("[admin.categories] load failed", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navCategories")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.categoriesSubtitle")}</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5"
            >
              <span className="text-3xl">🏠</span>
              <div className="flex-1">
                <div className="font-display text-lg font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.slug}</div>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                aria-label={t("ho.edit")}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive"
                aria-label={t("ho.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
