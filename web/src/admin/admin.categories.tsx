import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHotelTypes, createHotelType, deleteHotelType, type HotelTypeResponse } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zа-я0-9-]/gi, "");

export default function AdminCategories() {
  const { t } = useI18n();
  const [items, setItems] = useState<HotelTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getHotelTypes()
      .then(setItems)
      .catch((err) => console.error("[admin.categories] load failed", err))
      .finally(() => setLoading(false));
  }, []);

  async function add() {
    const n = name.trim();
    if (n.length < 2) return;
    setBusy(true);
    try {
      const created = await createHotelType(n, slugify(n) || `type-${Date.now()}`);
      setItems((prev) => [...prev, created]);
      setName("");
    } catch (err) {
      console.error("[admin.categories] create failed", err);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    try {
      await deleteHotelType(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("[admin.categories] delete failed", err);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navCategories")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.categoriesSubtitle")}</p>

      <div className="mt-6 flex max-w-md gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("ad.newCategory")} />
        <Button onClick={add} disabled={busy} className="gap-1 rounded-xl">
          <Plus className="h-4 w-4" /> {t("ad.add")}
        </Button>
      </div>

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
                onClick={() => remove(c.id)}
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
