import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { type Estate } from "@/lib/mock-data";
import { getFavoriteEstates } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

export default function FavoritesPage() {
  const { t, td } = useI18n();
  useDocumentTitle(t("fav.docTitle"));
  const [favs, setFavs] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFavoriteEstates()
      .then((items) => {
        if (active) setFavs(items);
      })
      .catch((err) => console.error("[favorites] failed to load", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="container-app py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t("fav.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("fav.subtitle")}</p>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : favs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-3 font-display text-lg font-bold">{t("fav.empty")}</div>
            <p className="mt-1 text-sm text-muted-foreground">{t("fav.emptyHint")}</p>
            <Link
              to="/estates"
              className="mt-5 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {t("detail.backToCatalog")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((e) => (
              <Link
                key={e.id}
                to={`/estates/${e.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={e.cover}
                    alt={e.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/95 backdrop-blur">
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                      {td(e.type)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {e.rating}
                    </span>
                  </div>
                  <div className="mt-2 font-display text-lg font-bold">{td(e.name)}</div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {td(e.address)}
                  </div>
                  <div className="mt-3 font-display text-lg font-extrabold">
                    {t("card.from")} {e.priceFrom.toLocaleString("ru-RU")}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      {t("common.kgs")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
