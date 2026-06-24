import { Link } from "react-router-dom";
import { Heart, MapPin, Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { estates } from "@/lib/mock-data";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

export default function FavoritesPage() {
  const { t, td } = useI18n();
  useDocumentTitle(t("fav.docTitle"));
  const favs = estates.slice(0, 3);
  return (
    <AppShell>
      <div className="container-app py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t("fav.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("fav.subtitle")}</p>
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
      </div>
    </AppShell>
  );
}
