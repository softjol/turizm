import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Building2,
  Home,
  ImageIcon,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import {
  getHotelTypes,
  getAmenities,
  createHotel,
  setHotelAmenities,
  uploadHotelImage,
  addMyHotelId,
  type HotelTypeResponse,
  type AmenityResponse,
} from "@/lib/api";

function parseCoords(input: string): { latitude: number | null; longitude: number | null } {
  const [latRaw, lngRaw] = input.split(",").map((s) => s.trim());
  const latitude = latRaw ? Number(latRaw) : NaN;
  const longitude = lngRaw ? Number(lngRaw) : NaN;
  return {
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}

export default function NewObjectWizard() {
  const { t } = useI18n();
  useDocumentTitle(t("no.docTitle"));
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [hotelTypes, setHotelTypes] = useState<HotelTypeResponse[]>([]);
  const [amenityList, setAmenityList] = useState<AmenityResponse[]>([]);

  const [hotelTypeId, setHotelTypeId] = useState<number | null>(null);
  const [amenities, setAmenities] = useState<number[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [checkIn, setCheckIn] = useState("14:00");
  const [checkOut, setCheckOut] = useState("12:00");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHotelTypes()
      .then(setHotelTypes)
      .catch(() => setHotelTypes([]));
    getAmenities()
      .then(setAmenityList)
      .catch(() => setAmenityList([]));
  }, []);

  function describeError(err: unknown): string {
    if (isAxiosError(err)) {
      const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        return detail
          .map((d: { msg?: string; loc?: unknown[] }) =>
            d.loc ? `${d.loc.slice(-1)}: ${d.msg}` : d.msg,
          )
          .join("; ");
      }
      return err.message;
    }
    return err instanceof Error ? err.message : t("no.createError");
  }

  function handleNext() {
    setError(null);
    if (step === 1) {
      if (hotelTypeId === null) {
        setError(t("no.errType"));
        return;
      }
    }
    if (step === 2) {
      if (name.trim().length < 2 || description.trim().length < 10 || address.trim().length < 5) {
        setError(t("no.errFields"));
        return;
      }
      if (phone.trim().length < 5 || whatsapp.trim().length < 5) {
        setError(t("no.errContacts"));
        return;
      }
    }
    setStep((s) => s + 1);
  }

  async function handlePublish() {
    setError(null);

    const { latitude, longitude } = parseCoords(coords);
    setSubmitting(true);
    try {
      const hotel = await createHotel({
        hotel_type_id: hotelTypeId,
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        latitude,
        longitude,
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim() || null,
        check_in_time: checkIn,
        check_out_time: checkOut,
        latitude: null,
        longitude: null,
      });
      if (amenities.length > 0) {
        await setHotelAmenities(hotel.id, amenities);
      }
      for (let i = 0; i < photos.length; i++) {
        await uploadHotelImage(hotel.id, photos[i], i === 0).catch(() => {});
      }
      addMyHotelId(hotel.id);
      navigate("/host/objects");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {step === 0 ? (
        <Intro onStart={() => setStep(1)} />
      ) : (
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-soft)] md:p-10">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">{t("no.stepOf", { n: step })}</div>

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <Step title={t("no.step1Title")}>
              {hotelTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("no.loadingTypes")}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {hotelTypes.map((c) => {
                    const active = hotelTypeId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setHotelTypeId(c.id)}
                        className={`flex flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left transition ${
                          active
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex w-full items-start justify-between">
                          <Building2 className="h-6 w-6" />
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                          >
                            {active && <Check className="h-3 w-3" />}
                          </span>
                        </div>
                        <div className="font-semibold">{c.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Step>
          )}

          {step === 2 && (
            <Step title={t("no.step2Title")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t("no.fName")}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("no.fNamePh")}
                  />
                </Field>
                <Field label={t("no.fAddress")}>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("no.fAddressPh")}
                  />
                </Field>
                <Field label={t("no.fEmail")}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hotel@example.com"
                  />
                </Field>
                <Field label={t("no.fPhone")}>
                  <PhoneInput value={phone} onChange={setPhone} />
                </Field>
                <Field label="WhatsApp">
                  <PhoneInput value={whatsapp} onChange={setWhatsapp} />
                </Field>
                <Field label={t("no.fCheckIn")}>
                  <Input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </Field>
                <Field label={t("no.fCheckOut")}>
                  <Input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={t("no.fDesc")}>
                    <Textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("no.fDescPh")}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("no.amenities")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenityList.map((a) => {
                      const active = amenities.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() =>
                            setAmenities((s) =>
                              s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id],
                            )
                          }
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title={t("no.step3Title")} subtitle={t("no.step3Sub")}>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface p-12 transition hover:border-primary hover:bg-accent/40">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {photos.length > 0 ? t("no.photosSelected", { n: photos.length }) : t("no.dropHint")}
                </span>
                <span className="inline-flex items-center gap-2 font-semibold text-primary">
                  <Upload className="h-4 w-4" /> {t("no.uploadBtn")}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                />
              </label>
            </Step>
          )}

          {step === 4 && (
            <Step title={t("no.step4Title")} subtitle={t("no.step4Sub")}>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Check className="h-4 w-4 text-success" /> {t("no.modNote")}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t("no.modNote2")}</p>
              </div>
            </Step>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border/70 pt-5">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="gap-2"
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4" /> {t("no.back")}
            </Button>
            <div className="flex gap-2">
              {step < 4 ? (
                <Button onClick={handleNext} className="gap-2 rounded-xl">
                  {t("no.continue")} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handlePublish} disabled={submitting} className="gap-2 rounded-xl">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {t("no.publish")} <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  const steps = [
    { t: t("no.s1t"), d: t("no.s1d") },
    { t: t("no.s2t"), d: t("no.s2d") },
    { t: t("no.s3t"), d: t("no.s3d") },
    { t: t("no.s4t"), d: t("no.s4d") },
  ];
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-8 md:p-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
          <Home className="h-9 w-9" />
        </div>
        <h1 className="mt-8 font-display text-4xl font-extrabold leading-tight text-primary md:text-6xl">
          {t("no.introTitle")}
        </h1>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-5 rounded-2xl bg-card p-8 shadow-[var(--shadow-card)] sm:grid-cols-2">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">
              {i + 1}
            </div>
            <div>
              <div className="font-semibold">{s.t}</div>
              <div className="text-sm text-muted-foreground">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-between">
        <Button variant="ghost" asChild>
          <Link to="/host">{t("no.back")}</Link>
        </Button>
        <Button size="lg" onClick={onStart} className="rounded-xl px-8">
          {t("no.start")}
        </Button>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-center font-display text-2xl font-extrabold md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}
