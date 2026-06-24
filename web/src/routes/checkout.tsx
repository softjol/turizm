import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
  Clock,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { type Estate } from "@/lib/mock-data";
import { getEstate, createBooking, getAccessToken } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

const paymentMethods: { id: string; label: string; labelKey?: string; hintKey: string }[] = [
  { id: "mbank", label: "MBank", hintKey: "pay.mbank.hint" },
  { id: "megapay", label: "MegaPay", hintKey: "pay.wallet.hint" },
  { id: "odengi", label: "О!Деньги", hintKey: "pay.wallet.hint" },
  { id: "elcart", label: "Элкарт", hintKey: "pay.elcart.hint" },
  { id: "card", label: "Банковская карта", labelKey: "pay.card.label", hintKey: "pay.card.hint" },
];

export default function CheckoutPage() {
  const { t, td, lang } = useI18n();
  useDocumentTitle(t("co.docTitle"));
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [estate, setEstate] = useState<Estate | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"confirm" | "pay" | "done">("confirm");
  const [method, setMethod] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIn = params.get("checkIn") ?? "2026-07-10";
  const checkOut = params.get("checkOut") ?? "2026-07-14";
  const guests = Number(params.get("guests") ?? 2);

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
        console.error("[checkout] failed to load estate", err);
        if (active) setEstate(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const room = estate?.rooms.find((r) => r.id === params.get("room")) ?? estate?.rooms[0];

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
  const total = (room?.price ?? 0) * nights;
  const deposit = Math.round(total * 0.3);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const dateLocale = lang === "en" ? "en-US" : "ru-RU";
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "long" });

  async function handlePay() {
    if (!room) return;
    // Booking creation requires authentication — send guests to login first.
    if (!getAccessToken()) {
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        room_id: Number(room.id),
        date_from: checkIn,
        date_to: checkOut,
        guests,
      });
      setStep("done");
    } catch (err) {
      const detail = isAxiosError(err)
        ? (err.response?.data as { detail?: string })?.detail
        : undefined;
      setError(detail ?? "Не удалось создать бронирование. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="container-app flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!estate || !room) {
    return (
      <AppShell>
        <div className="container-app py-24 text-center">
          <h1 className="font-display text-3xl font-bold">{t("co.notFound")}</h1>
          <Button asChild className="mt-6">
            <Link to="/estates">{t("detail.backToCatalog")}</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container-app max-w-4xl py-8">
        {/* Steps header */}
        <div className="flex items-center gap-3 text-sm">
          {[
            { key: "confirm", label: t("co.stepConfirm") },
            { key: "pay", label: t("co.stepPay") },
            { key: "done", label: t("co.stepDone") },
          ].map((s, i) => {
            const order = ["confirm", "pay", "done"];
            const active = order.indexOf(step) >= i;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={active ? "font-semibold" : "text-muted-foreground"}>
                  {s.label}
                </span>
                {i < 2 && <span className="h-px w-6 bg-border" />}
              </div>
            );
          })}
        </div>

        {step === "done" ? (
          <div className="mt-10 rounded-3xl border border-border/70 bg-card p-10 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-extrabold">{t("co.depositPaid")}</h1>
            <p className="mt-2 text-muted-foreground">
              {t("co.statusLabel")}{" "}
              <span className="font-semibold text-warning-foreground">
                {td("Ожидает подтверждения")}
              </span>
              . {t("co.notifiedHost", { name: td(estate.name) })}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm">
              <Clock className="h-4 w-4" /> {t("co.confirmTime")}
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/estates">{t("co.toCatalog")}</Link>
              </Button>
              <Button asChild>
                <Link to="/bookings">{t("co.myBookings")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left: confirm or pay */}
            <div>
              {step === "confirm" ? (
                <div className="space-y-6">
                  <h1 className="font-display text-2xl font-extrabold">{t("co.checkTitle")}</h1>

                  <Section title={t("co.hotel")}>
                    <div className="flex gap-4">
                      <img
                        src={estate.cover}
                        alt=""
                        className="h-20 w-28 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-display text-lg font-bold">{td(estate.name)}</div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {td(estate.address)}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{td(estate.type)}</div>
                      </div>
                    </div>
                  </Section>

                  <Section title={t("co.room")}>
                    <Row label={t("co.roomType")} value={`${td(room.name)} · ${td(room.type)}`} />
                    <Row
                      label={t("co.pricePerNight")}
                      value={`${fmt(room.price)} ${t("common.kgs")}`}
                    />
                  </Section>

                  <Section title={t("co.datesGuests")}>
                    <Row label={t("search.checkin")} value={fmtDate(checkIn)} />
                    <Row label={t("search.checkout")} value={fmtDate(checkOut)} />
                    <Row label={t("co.nights")} value={`${nights}`} />
                    <Row label={t("co.guests")} value={`${guests}`} />
                  </Section>
                </div>
              ) : (
                <div className="space-y-6">
                  <h1 className="font-display text-2xl font-extrabold">{t("co.choosePay")}</h1>
                  <p className="text-sm text-muted-foreground">
                    {t("co.payHint", { d: fmt(deposit) })}
                  </p>
                  <div className="space-y-2">
                    {paymentMethods.map((m) => {
                      const active = method === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition ${
                            active
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            {m.id === "card" ? (
                              <CreditCard className="h-5 w-5" />
                            ) : (
                              <Smartphone className="h-5 w-5" />
                            )}
                          </span>
                          <span className="flex-1">
                            <span className="block font-semibold">
                              {m.labelKey ? t(m.labelKey) : m.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {t(m.hintKey)}
                            </span>
                          </span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: summary */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="font-display text-lg font-bold">{t("co.total")}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <Row
                    label={t("detail.priceTimesNights", { price: fmt(room.price), n: nights })}
                    value={`${fmt(total)} ${t("common.kgs")}`}
                  />
                  <Row label={t("detail.serviceFee")} value={`0 ${t("common.kgs")}`} />
                  <div className="my-2 border-t border-border" />
                  <Row
                    label={<span className="font-bold">{t("co.totalCost")}</span>}
                    value={
                      <span className="font-display text-lg font-extrabold">
                        {fmt(total)} {t("common.kgs")}
                      </span>
                    }
                  />
                  <Row
                    label={t("detail.deposit")}
                    value={
                      <span className="font-semibold text-primary">
                        {fmt(deposit)} {t("common.kgs")}
                      </span>
                    }
                  />
                </div>

                {step === "confirm" ? (
                  <Button
                    size="lg"
                    className="mt-5 w-full rounded-xl"
                    onClick={() => setStep("pay")}
                  >
                    {t("co.payDeposit")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="mt-5 w-full rounded-xl"
                    disabled={!method || submitting}
                    onClick={handlePay}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("co.payNow", { d: fmt(deposit) })
                    )}
                  </Button>
                )}

                {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> {t("co.securePay")}
                </div>

                <Link
                  to={`/estates/${estate.id}`}
                  className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> {t("co.backToStay")}
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
