import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";
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
  Minus,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { type Estate } from "@/lib/types";
import { getEstate, isFavorite, toggleFavorite } from "@/lib/api";
import { DatePicker } from "@/components/DatePicker";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import { useAutoTranslate, T } from "@/lib/translate";
import { defaultStayDates } from "@/lib/utils";

/** Single support contact shown on every listing, regardless of the host's own data. */
const SUPPORT_PHONE = "+996 550 132 808";

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Wi-Fi": Wifi,
  Парковка: Car,
  Кондиционер: Snowflake,
  Завтрак: Coffee,
};

type BedChoice = { roomId: string; bed: number };

function bestPlacesForGuests(estate: Estate, guests: number) {
  type Choice = { price: number; roomIds: string[]; beds: BedChoice[] };
  let states = new Map<number, Choice>([[0, { price: 0, roomIds: [], beds: [] }]]);

  for (const room of estate.rooms) {
    const options: { capacity: number; price: number; roomId?: string; beds?: BedChoice[] }[] = [
      { capacity: 0, price: 0 },
      { capacity: room.capacity, price: room.price, roomId: room.id },
    ];
    if (room.pricePerBed && room.bedCount > 0) {
      for (let count = 1; count <= room.bedCount; count += 1) {
        options.push({
          capacity: count,
          price: room.pricePerBed * count,
          beds: Array.from({ length: count }, (_, index) => ({
            roomId: room.id,
            bed: index + 1,
          })),
        });
      }
    }
    const next = new Map<number, Choice>();
    for (const [capacity, choice] of states) {
      for (const option of options) {
        const nextCapacity = Math.min(guests, capacity + option.capacity);
        const candidate: Choice = {
          price: choice.price + option.price,
          roomIds: option.roomId ? [...choice.roomIds, option.roomId] : choice.roomIds,
          beds: option.beds ? [...choice.beds, ...option.beds] : choice.beds,
        };
        if (!next.has(nextCapacity) || candidate.price < next.get(nextCapacity)!.price) {
          next.set(nextCapacity, candidate);
        }
      }
    }
    states = next;
  }
  return states.get(guests) ?? { price: 0, roomIds: [], beds: [] };
}

export default function EstateDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [estate, setEstate] = useState<Estate | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    const hotelId = Number(id);
    if (!Number.isFinite(hotelId)) {
      setLoading(false);
      return;
    }
    getEstate(hotelId)
      .then((e) => setEstate(e))
      .catch((err) => {
        console.error("[detail] failed to load estate", err);
        setEstate(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

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
  return <EstateView estate={estate} onReload={reload} />;
}

function EstateView({ estate, onReload }: { estate: Estate; onReload: () => void }) {
  const { t, td } = useI18n();
  useDocumentTitle(`${td(estate.name)} - StayKG`);
  const initialPlaces = bestPlacesForGuests(estate, 2);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(initialPlaces.roomIds);
  const [selectedBeds, setSelectedBeds] = useState<BedChoice[]>(initialPlaces.beds);
  const selectedRooms = estate.rooms.filter((r) => selectedRoomIds.includes(r.id));
  const totalCapacity = selectedRooms.reduce((sum, r) => sum + r.capacity, 0) + selectedBeds.length;

  function toggleRoom(roomId: string) {
    const hasSelectedBeds = selectedBeds.some((b) => b.roomId === roomId);
    setSelectedBeds((prev) => prev.filter((b) => b.roomId !== roomId));
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) || hasSelectedBeds
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId],
    );
  }
  const [checkIn, setCheckIn] = useState(() => defaultStayDates().checkIn);
  const [checkOut, setCheckOut] = useState(() => defaultStayDates().checkOut);
  const [guests, setGuests] = useState(2);
  const [fav, setFav] = useState(() => isFavorite(Number(estate.id)));
  const [copied, setCopied] = useState(false);

  const maxGuests = estate.rooms.reduce(
    (sum, room) => sum + Math.max(room.capacity, room.bedCount),
    0,
  );

  function changeGuests(nextGuests: number) {
    const next = Math.max(1, Math.min(nextGuests, maxGuests || 1));
    const places = bestPlacesForGuests(estate, next);
    setGuests(next);
    setSelectedRoomIds(places.roomIds);
    setSelectedBeds(places.beds);
  }

  // User-entered content (not in the i18n dictionary) → machine-translated.
  const nameText = useAutoTranslate(estate.name);
  const addressText = useAutoTranslate(estate.address);
  const aboutText = useAutoTranslate(estate.description);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
  const bedsTotal = selectedBeds.reduce(
    (sum, b) => sum + (estate.rooms.find((r) => r.id === b.roomId)?.pricePerBed ?? 0),
    0,
  );
  const total = (selectedRooms.reduce((sum, r) => sum + r.price, 0) + bedsTotal) * nights;
  const deposit = Math.round(total * 0.2);

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
            <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">{nameText}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-warning text-warning" /> {estate.rating}
                <span className="text-muted-foreground">
                  ({estate.reviewsCount} {t("card.reviews")})
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {addressText}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}{" "}
              {copied ? t("detail.linkCopied") : t("detail.share")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setFav(toggleFavorite(Number(estate.id)))}
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : ""}`} />{" "}
              {t("detail.favorite")}
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
              <p className="mt-3 leading-relaxed text-muted-foreground">{aboutText}</p>
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
              {estate.rooms.length > 1 && (
                <p className="mt-1 text-sm text-muted-foreground">{t("detail.selectRoomsHint")}</p>
              )}
              <div className="mt-4 space-y-3">
                {estate.rooms.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">
                    {t("detail.noRooms")}
                  </div>
                )}
                {estate.rooms.map((r: (typeof estate.rooms)[number]) => {
                  const roomBeds = selectedBeds.filter((b) => b.roomId === r.id);
                  const checked = selectedRoomIds.includes(r.id) || roomBeds.length > 0;
                  const displayedPrice = selectedRoomIds.includes(r.id)
                    ? r.price
                    : roomBeds.length > 0
                      ? roomBeds.length * (r.pricePerBed ?? r.price)
                      : r.price;
                  return (
                    <div
                      key={r.id}
                      onClick={() => toggleRoom(r.id)}
                      role="button"
                      tabIndex={0}
                      className={`relative flex w-full flex-wrap gap-4 overflow-hidden rounded-2xl border bg-card p-2 text-left transition ${
                        checked
                          ? "border-primary shadow-[var(--shadow-soft)]"
                          : "border-border/70 hover:border-primary/50"
                      }`}
                    >
                      <div className="relative h-28 w-36 flex-shrink-0">
                        <img
                          src={r.image}
                          alt=""
                          loading="lazy"
                          className="h-28 w-36 rounded-xl object-cover"
                        />
                        <span
                          className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-card ${
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col py-1 pr-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-display text-lg font-bold">
                              <T text={r.name} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {td(r.type)} · {t("detail.upToGuests", { n: r.capacity })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-xl font-extrabold">
                              {displayedPrice.toLocaleString("ru-RU")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t("detail.perNight")}
                            </div>
                          </div>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          <T text={r.description} />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold">{t("detail.location")}</h2>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {addressText}
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
              <ReviewForm hotelId={Number(estate.id)} onSubmitted={onReload} />
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
                    <p className="mt-3 text-sm leading-relaxed">
                      <T text={rv.text} />
                    </p>
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
                  href={`tel:${SUPPORT_PHONE}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:border-primary"
                >
                  <Phone className="h-4 w-4" /> {SUPPORT_PHONE}
                </a>
                <a
                  href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`}
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
              {selectedRooms.length === 0 && selectedBeds.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {estate.rooms.length === 0 ? t("detail.noRooms") : t("detail.selectRoomsHint")}
                </div>
              ) : (
              <>
              <div className="space-y-2">
                {selectedRooms.map((r) => (
                  <div key={r.id} className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      <T text={r.name} />
                    </span>
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {r.price.toLocaleString("ru-RU")} {t("common.kgs")}/{t("detail.perNight")}
                    </span>
                  </div>
                ))}
                {selectedBeds.map((b) => {
                  const room = estate.rooms.find((r) => r.id === b.roomId)!;
                  return (
                    <div key={`${b.roomId}-${b.bed}`} className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium"><T text={room.name} /> · 1 место</span>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {room.pricePerBed!.toLocaleString("ru-RU")} {t("common.kgs")}/{t("detail.perNight")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                  <Field label={t("search.checkin")} icon={CalendarIcon}>
                    <DatePicker value={checkIn} onChange={setCheckIn} />
                  </Field>
                  <Field label={t("search.checkout")} icon={CalendarIcon}>
                    <DatePicker value={checkOut} onChange={setCheckOut} min={checkIn} />
                  </Field>
                </div>
                <Field label={t("search.guests")} icon={Users}>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => changeGuests(guests - 1)}
                      disabled={guests <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Уменьшить количество гостей"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="text-center">
                      <div className="font-display text-lg font-bold">{guests}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {guests === 1 ? "гость" : guests < 5 ? "гостя" : "гостей"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => changeGuests(guests + 1)}
                      disabled={guests >= maxGuests}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Увеличить количество гостей"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </Field>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                При изменении гостей автоматически подбирается самый выгодный вариант.
              </p>

              {totalCapacity < guests && (
                <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Выберите ещё комнату или кровать для {guests} гостей.
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm">
                <Row
                  label={`${guests} ${guests === 1 ? "гость" : guests < 5 ? "гостя" : "гостей"} × ${nights} ${nights === 1 ? "ночь" : "ночей"}`}
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

              {totalCapacity >= guests ? (
                <Button asChild size="lg" className="mt-5 w-full rounded-xl">
                  <Link
                    to={`/estates/${estate.id}/checkout?rooms=${selectedRoomIds.join(",")}&beds=${selectedBeds.map((b) => `${b.roomId}:${b.bed}`).join(",")}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                  >
                    {t("detail.book")}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="mt-5 w-full rounded-xl" disabled>
                  Недостаточно мест
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("detail.noCharge")}
              </p>
              </>
              )}
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
