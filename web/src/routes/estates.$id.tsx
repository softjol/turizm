import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Snowflake,
  Coffee,
  Phone,
  MessageCircle,
  Calendar as CalendarIcon,
  Users,
  Heart,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { type Estate } from "@/lib/mock-data";
import { getEstate } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Wi-Fi": Wifi,
  Парковка: Car,
  Кондиционер: Snowflake,
  Завтрак: Coffee,
};

export default function EstateDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [estate, setEstate] = useState<Estate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hotelId = Number(id);
    if (!Number.isFinite(hotelId)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getEstate(hotelId)
      .then((e) => {
        if (active) setEstate(e);
      })
      .catch((err) => {
        console.error("[detail] failed to load estate", err);
        if (active) setEstate(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="container-app flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppShell>
    );
  }
  if (!estate) {
    return (
      <AppShell>
        <div className="container-app py-24 text-center">
          <h1 className="font-display text-3xl font-bold">{t("detail.notFound")}</h1>
          <Button asChild className="mt-6">
            <Link to="/estates">{t("detail.backToCatalog")}</Link>
          </Button>
        </div>
      </AppShell>
    );
  }
  return <EstateView estate={estate} />;
}

function EstateView({ estate }: { estate: Estate }) {
  const { t, td } = useI18n();
  useDocumentTitle(`${td(estate.name)} — MEIMAN`);
  const [selectedRoom, setSelectedRoom] = useState(estate.rooms[0]);
  const [checkIn, setCheckIn] = useState("2026-07-10");
  const [checkOut, setCheckOut] = useState("2026-07-14");
  const [guests, setGuests] = useState(2);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
  const total = selectedRoom.price * nights;
  const deposit = Math.round(total * 0.3);

  return (
    <AppShell>
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/estates" className="hover:text-foreground">
                {t("detail.catalog")}
              </Link>
              <span>/</span>
              <span>{td(estate.type)}</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
              {td(estate.name)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-warning text-warning" /> {estate.rating}
                <span className="text-muted-foreground">
                  ({estate.reviewsCount} {t("card.reviews")})
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {td(estate.address)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> {t("detail.share")}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4" /> {t("detail.favorite")}
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-6 grid h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:gap-3">
          <img
            src={estate.images[0]}
            alt=""
            className="col-span-2 row-span-2 h-full w-full object-cover"
          />
          {estate.images.slice(1, 5).map((src: string, i: number) => (
            <img key={i} src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div>
            <section>
              <h2 className="font-display text-2xl font-bold">{t("detail.about")}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{td(estate.description)}</p>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold">{t("detail.amenities")}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {estate.amenities.map((a: string) => {
                  const Icon = amenityIcons[a] ?? Check;
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{td(a)}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold">{t("detail.rooms")}</h2>
              <div className="mt-4 space-y-3">
                {estate.rooms.map((r: (typeof estate.rooms)[number]) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoom(r)}
                    className={`flex w-full gap-4 overflow-hidden rounded-2xl border bg-card p-2 text-left transition ${
                      selectedRoom.id === r.id
                        ? "border-primary shadow-[var(--shadow-soft)]"
                        : "border-border/70 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={r.image}
                      alt=""
                      loading="lazy"
                      className="h-28 w-36 flex-shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex flex-1 flex-col py-1 pr-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-display text-lg font-bold">{td(r.name)}</div>
                          <div className="text-xs text-muted-foreground">
                            {td(r.type)} · {t("detail.upToGuests", { n: r.capacity })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-extrabold">
                            {r.price.toLocaleString("ru-RU")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t("detail.perNight")}
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {td(r.description)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold">{t("detail.location")}</h2>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {td(estate.address)}
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
                <iframe
                  title={t("detail.location")}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(estate.address)}&z=11&output=embed`}
                />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold">{t("detail.reviewsTitle")}</h2>
              <div className="mt-4 space-y-4">
                {estate.reviews.map((rv: (typeof estate.reviews)[number]) => (
                  <div key={rv.id} className="rounded-2xl border border-border/70 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                          {td(rv.author)[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{td(rv.author)}</div>
                          <div className="text-xs text-muted-foreground">{rv.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rv.rating ? "fill-warning text-warning" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">{td(rv.text)}</p>
                    {rv.reply && (
                      <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                        <div className="text-xs font-semibold text-muted-foreground">
                          {t("detail.hostReply")}
                        </div>
                        <div className="mt-1">{td(rv.reply)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold">{t("detail.contacts")}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {td(estate.host.name)[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{td(estate.host.name)}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("detail.checkInOut", { in: estate.checkIn, out: estate.checkOut })}
                  </div>
                </div>
                <a
                  href={`tel:${estate.host.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-primary"
                >
                  <Phone className="h-4 w-4" /> {estate.host.phone}
                </a>
                <a
                  href={`https://wa.me/${estate.host.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-medium text-success-foreground"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </section>
          </div>

          {/* Booking widget */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold">
                  {selectedRoom.price.toLocaleString("ru-RU")}
                </span>
                <span className="text-sm text-muted-foreground">{t("detail.perNight")}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{td(selectedRoom.name)}</div>

              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                  <Field label={t("search.checkin")} icon={CalendarIcon}>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none"
                    />
                  </Field>
                  <Field label={t("search.checkout")} icon={CalendarIcon}>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none"
                    />
                  </Field>
                </div>
                <Field label={t("search.guests")} icon={Users}>
                  <input
                    type="number"
                    min={1}
                    max={selectedRoom.capacity}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  />
                </Field>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <Row
                  label={t("detail.priceTimesNights", {
                    price: selectedRoom.price.toLocaleString("ru-RU"),
                    n: nights,
                  })}
                  value={`${total.toLocaleString("ru-RU")} ${t("common.kgs")}`}
                />
                <Row label={t("detail.serviceFee")} value={`0 ${t("common.kgs")}`} />
                <div className="my-2 border-t border-border" />
                <Row
                  label={<span className="font-bold">{t("detail.total")}</span>}
                  value={
                    <span className="font-display text-lg font-extrabold">
                      {total.toLocaleString("ru-RU")} {t("common.kgs")}
                    </span>
                  }
                />
                <Row
                  label={t("detail.deposit")}
                  value={
                    <span className="font-semibold text-primary">
                      {deposit.toLocaleString("ru-RU")} {t("common.kgs")}
                    </span>
                  }
                />
              </div>

              <Button asChild size="lg" className="mt-5 w-full rounded-xl">
                <Link
                  to={`/estates/${estate.id}/checkout?room=${selectedRoom.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                >
                  {t("detail.book")}
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("detail.noCharge")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
