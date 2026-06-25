import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listReceptionHotels,
  getHotelRooms,
  createRoom,
  type RoomResponse,
  type RoomType,
  type Hotel,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ROOM_TYPES: { value: RoomType; labelKey: string }[] = [
  { value: "standard", labelKey: "hrm.typeStandard" },
  { value: "semi_lux", labelKey: "hrm.typeSemiLux" },
  { value: "lux", labelKey: "hrm.typeLux" },
  { value: "family", labelKey: "hrm.typeFamily" },
  { value: "dorm", labelKey: "hrm.typeDorm" },
];

export default function HostRooms() {
  const { t } = useI18n();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const hs = await listReceptionHotels();
        if (!active) return;
        setHotels(hs);
        const all: RoomResponse[] = [];
        for (const h of hs) all.push(...(await getHotelRooms(h.id).catch(() => [])));
        if (active) {
          setRooms(all);
          setHotelId(hs[0]?.id ?? null);
        }
      } catch (err) {
        console.error("[host.rooms] load failed", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function onCreated(room: RoomResponse) {
    setRooms((prev) => [...prev, room]);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{t("hrm.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("hrm.subtitle")}</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          disabled={hotelId === null}
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" /> {t("hrm.add")}
        </Button>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : rooms.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("hrm.empty")}
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {rooms.map((r) => {
            const cover = r.images.find((i) => i.is_main)?.url ?? r.images[0]?.url;
            return (
              <div
                key={r.id}
                className="grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[160px_1fr_auto]"
              >
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="h-28 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                    {t("ho.noPhoto")}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                      {r.type}
                    </span>
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                      {t("hrm.available")}
                    </span>
                  </div>
                  <div className="mt-2 font-display text-lg font-bold">{r.name}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <span>👤 {t("hrm.upTo", { n: r.capacity_adults + r.capacity_children })}</span>
                    <span>
                      {Number(r.price_per_night).toLocaleString("ru-RU")} {t("common.kgs")} /{" "}
                      {t("hrm.perNight")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
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
              </div>
            );
          })}
        </div>
      )}

      {showForm && hotelId !== null && (
        <RoomForm
          hotelId={hotelId}
          hotels={hotels}
          onPickHotel={setHotelId}
          onClose={() => setShowForm(false)}
          onCreated={onCreated}
        />
      )}
    </div>
  );
}

function RoomForm({
  hotelId,
  hotels,
  onPickHotel,
  onClose,
  onCreated,
}: {
  hotelId: number;
  hotels: Hotel[];
  onPickHotel: (id: number) => void;
  onClose: () => void;
  onCreated: (r: RoomResponse) => void;
}) {
  const { t } = useI18n();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<RoomType>("standard");
  const [price, setPrice] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (number.trim().length < 1 || name.trim().length < 2 || description.trim().length < 5) {
      setError(t("hrm.validation"));
      return;
    }
    setSaving(true);
    try {
      const room = await createRoom(hotelId, {
        room_number: number.trim(),
        name: name.trim(),
        type,
        price_per_night: Number(price) || 0,
        capacity_adults: Number(adults) || 1,
        capacity_children: Number(children) || 0,
        description: description.trim(),
      });
      onCreated(room);
    } catch (err) {
      setError(
        isAxiosError(err)
          ? ((err.response?.data as { detail?: string } | undefined)?.detail ?? err.message)
          : t("hrm.validation"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{t("hrm.addTitle")}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
            aria-label={t("hrm.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {hotels.length > 1 && (
            <Field label={t("hrm.hotel")}>
              <select
                value={hotelId}
                onChange={(e) => onPickHotel(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label={t("hrm.number")}>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="101" />
          </Field>
          <Field label={t("hrm.name")}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("hrm.namePh")}
            />
          </Field>
          <Field label={t("hrm.type")}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RoomType)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {t(rt.labelKey)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("hrm.price")}>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="3500"
            />
          </Field>
          <Field label={t("hrm.adults")}>
            <Input
              type="number"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              min={1}
            />
          </Field>
          <Field label={t("hrm.children")}>
            <Input
              type="number"
              value={children}
              onChange={(e) => setChildren(e.target.value)}
              min={0}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label={t("hrm.descLabel")}>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("hrm.descPh")}
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-2 border-t border-border/70 pt-5">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("hrm.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("hrm.save")}
          </Button>
        </div>
      </div>
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
