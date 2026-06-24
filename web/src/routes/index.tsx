import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HeadphonesIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/DatePicker";
import { categories, type Estate } from "@/lib/mock-data";
import heroImg from "@/assets/hero.jpg";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import { getEstates } from "@/lib/api";

export default function HomePage() {
  const { t, td } = useI18n();
  const navigate = useNavigate();
  useDocumentTitle(t("home.docTitle"));

  const [estates, setEstates] = useState<Estate[]>([]);

  // Search-bar state (drives the /estates query on submit).
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  function runSearch() {
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    navigate(`/estates${params.toString() ? `?${params.toString()}` : ""}`);
  }

  // Load the most-recent approved hotels for the "popular" section.
  useEffect(() => {
    let active = true;
    getEstates({ limit: 6 })
      .then((list) => {
        if (active) setEstates(list);
      })
      .catch((err) => console.error("[home] failed to load estates", err));
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt={t("home.heroAlt")}
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        </div>
        <div className="container-app pb-10 pt-16 md:pb-14 md:pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t("home.badge")}
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              {t("home.title")} <span className="text-primary">{t("home.titleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              {t("home.subtitle")}
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="mt-6 rounded-2xl border border-border/70 bg-card p-2 shadow-[var(--shadow-card)] md:mt-8"
          >
            <div className="grid items-center gap-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/60">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("search.destination")}
                  </div>
                  <input
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/70"
                    placeholder={t("search.destPlaceholder")}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/60">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("search.checkin")}
                  </div>
                  <DatePicker
                    value={checkIn}
                    onChange={setCheckIn}
                    placeholder={t("search.pickDate")}
                  />
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/60">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("search.checkout")}
                  </div>
                  <DatePicker
                    value={checkOut}
                    onChange={setCheckOut}
                    min={checkIn || undefined}
                    placeholder={t("search.pickDate")}
                  />
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted/60">
                <Users className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("search.guests")}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                  />
                </div>
              </label>
              <Button type="submit" size="lg" className="h-14 gap-2 rounded-xl px-7">
                <Search className="h-4 w-4" /> {t("search.find")}
              </Button>
            </div>
          </form>

          {/* Quick filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.type}
                to="/estates"
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <span>{c.icon}</span>
                {td(c.type)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-app py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: t("benefit1.title"),
              text: t("benefit1.text"),
            },
            {
              icon: Sparkles,
              title: t("benefit2.title"),
              text: t("benefit2.text"),
            },
            {
              icon: HeadphonesIcon,
              title: t("benefit3.title"),
              text: t("benefit3.text"),
            },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <b.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-lg font-bold">{b.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular estates */}
      <section className="container-app py-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t("popular.eyebrow")}
            </div>
            <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">
              {t("popular.title")}
            </h2>
          </div>
          <Link
            to="/estates"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex"
          >
            {t("popular.all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {estates.slice(0, 6).map((e) => (
            <EstateCard key={e.id} e={e} />
          ))}
        </div>
      </section>

      {/* CTA host */}
      <section className="container-app py-16">
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary-soft via-background to-accent p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-extrabold md:text-4xl">{t("cta.title")}</h3>
              <p className="mt-3 text-muted-foreground">{t("cta.text")}</p>
              <Button asChild size="lg" className="mt-6 rounded-xl">
                <Link to="/host">
                  {t("cta.start")} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ul className="grid gap-3 text-sm">
              {[t("cta.step1"), t("cta.step2"), t("cta.step3"), t("cta.step4")].map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-xl bg-background/70 p-3 backdrop-blur"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function EstateCard({ e }: { e: Estate }) {
  const { t, td } = useI18n();
  return (
    <Link
      to={`/estates/${e.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={e.cover}
          alt={e.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold backdrop-blur">
          {td(e.type)}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {e.rating}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="font-display text-lg font-bold leading-tight">{td(e.name)}</div>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {td(e.address)}
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="text-xs text-muted-foreground">{t("card.from")}</div>
            <div className="font-display text-xl font-extrabold">
              {e.priceFrom.toLocaleString("ru-RU")}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                {t("card.perNight")}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {e.reviewsCount} {t("card.reviews")}
          </div>
        </div>
      </div>
    </Link>
  );
}
