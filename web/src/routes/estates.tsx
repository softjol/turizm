import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Star, SlidersHorizontal, Search, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allAmenities, categories, type Estate, type EstateType } from "@/lib/mock-data";
import { getEstates } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

export default function EstatesPage() {
  const { t, td } = useI18n();
  useDocumentTitle(t("catalog.docTitle"));
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState<number[]>([1000, 10000]);
  const [types, setTypes] = useState<EstateType[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");

  // Load the catalog once; filtering/sorting stays client-side over the result.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getEstates()
      .then((list) => {
        if (active) setEstates(list);
      })
      .catch((err) => console.error("[catalog] failed to load estates", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = estates.filter((e) => {
      if (
        query &&
        !e.name.toLowerCase().includes(query.toLowerCase()) &&
        !e.address.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (e.priceFrom < price[0] || e.priceFrom > price[1]) return false;
      if (types.length && !types.includes(e.type)) return false;
      if (amenities.length && !amenities.every((a) => e.amenities.includes(a))) return false;
      if (e.rating < minRating) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "price-asc") return a.priceFrom - b.priceFrom;
      if (sort === "price-desc") return b.priceFrom - a.priceFrom;
      if (sort === "popular") return b.reviewsCount - a.reviewsCount;
      return b.rating - a.rating;
    });
  }, [estates, query, price, types, amenities, minRating, sort]);

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <AppShell>
      <div className="container-app py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t("catalog.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("catalog.found", { n: filtered.length })}</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Filters */}
          <aside className="space-y-6 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] h-fit lg:sticky lg:top-20">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" /> {t("filters.title")}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("filters.searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Section title={t("filters.type")}>
              <div className="space-y-2">
                {categories.map((c) => (
                  <label key={c.type} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={types.includes(c.type)}
                      onCheckedChange={() => toggle(types, setTypes, c.type)}
                    />
                    <span>
                      {c.icon} {td(c.type)}
                    </span>
                  </label>
                ))}
              </div>
            </Section>

            <Section
              title={t("filters.price", {
                a: price[0].toLocaleString("ru-RU"),
                b: price[1].toLocaleString("ru-RU"),
              })}
            >
              <Slider
                value={price}
                onValueChange={setPrice}
                min={500}
                max={15000}
                step={100}
                className="mt-2"
              />
            </Section>

            <Section title={t("filters.rating")}>
              <div className="flex flex-wrap gap-1.5">
                {[0, 3, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      minRating === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {r === 0 ? t("filters.all") : `${r}+`}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={t("filters.amenities")}>
              <div className="space-y-2">
                {allAmenities.map((a) => (
                  <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={amenities.includes(a)}
                      onCheckedChange={() => toggle(amenities, setAmenities, a)}
                    />
                    {td(a)}
                  </label>
                ))}
              </div>
            </Section>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setQuery("");
                setPrice([1000, 10000]);
                setTypes([]);
                setAmenities([]);
                setMinRating(0);
              }}
            >
              {t("filters.reset")}
            </Button>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-5 flex items-center justify-end">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">{t("sort.rating")}</SelectItem>
                  <SelectItem value="popular">{t("sort.popular")}</SelectItem>
                  <SelectItem value="price-asc">{t("sort.priceAsc")}</SelectItem>
                  <SelectItem value="price-desc">{t("sort.priceDesc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("catalog.title")}…
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                {t("catalog.empty")}
              </div>
            ) : (
              <div className="grid gap-5">
                {filtered.map((e) => (
                  <Link
                    key={e.id}
                    to={`/estates/${e.id}`}
                    className="group grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:shadow-[var(--shadow-card)] sm:grid-cols-[280px_1fr]"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-auto">
                      <img
                        src={e.cover}
                        alt={e.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold">
                        {td(e.type)}
                      </div>
                    </div>
                    <div className="flex flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-display text-xl font-bold">{td(e.name)}</div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {td(e.address)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-sm font-bold text-accent-foreground">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {e.rating}
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {td(e.description)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {e.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {td(a)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-end justify-between pt-4">
                        <div className="text-xs text-muted-foreground">
                          {e.reviewsCount} {t("card.reviews")}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{t("card.from")}</div>
                          <div className="font-display text-2xl font-extrabold">
                            {e.priceFrom.toLocaleString("ru-RU")}{" "}
                            <span className="text-sm font-medium text-muted-foreground">
                              {t("common.kgs")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}
