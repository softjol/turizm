import { useEffect, useState } from "react";
import { translateApiError } from "@/lib/apiError";
import { Plus, Edit2, Trash2, X, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listReceptionHotels,
  getHotelRooms,
  getRoomCalendar,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
  deleteRoomImage,
  mediaUrl,
  type RoomResponse,
  type RoomType,
  type Hotel,
  type HotelImage,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { T } from "@/lib/translate";

const ROOM_TYPES: { value: RoomType; labelKey: string }[] = [
  { value: "standard", labelKey: "hrm.typeStandard" },
  { value: "semi_lux", labelKey: "hrm.typeSemiLux" },
  { value: "lux", labelKey: "hrm.typeLux" },
  { value: "family", labelKey: "hrm.typeFamily" },
  { value: "dorm", labelKey: "hrm.typeDorm" },
];

const ROOM_TYPE_LABELS: Record<RoomType, string> = Object.fromEntries(
  ROOM_TYPES.map((rt) => [rt.value, rt.labelKey]),
) as Record<RoomType, string>;

type DisplayStatus = "maintenance" | "inactive" | "booked" | "available";

function roomDisplayStatus(r: RoomResponse, bookedToday: boolean): DisplayStatus {
  if (r.status === "maintenance") return "maintenance";
  if (r.status === "inactive") return "inactive";
  if (bookedToday) return "booked";
  return "available";
}

const STATUS_LABEL_KEYS: Record<DisplayStatus, string> = {
  available: "hrm.available",
  booked: "hrm.booked",
  maintenance: "hrm.maintenance",
  inactive: "hrm.inactive",
};

const STATUS_STYLES: Record<DisplayStatus, string> = {
  available: "bg-success/15 text-success",
  booked: "bg-primary/15 text-primary",
  maintenance: "bg-warning/15 text-warning",
  inactive: "bg-muted text-muted-foreground",
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function HostRooms() {
  const { t } = useI18n();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [bookedToday, setBookedToday] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoomResponse | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

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

        const today = new Date();
        const todayStr = iso(today);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = iso(tomorrow);
        const entries = await Promise.all(
          all.map(async (r) => {
            const cal = await getRoomCalendar(r.id, todayStr, tomorrowStr).catch(() => null);
            const booked =
              cal?.occupied_periods.some(
                (p) => todayStr >= p.date_from && todayStr < p.date_to,
              ) ?? false;
            return [r.id, booked] as const;
          }),
        );
        if (active) setBookedToday(Object.fromEntries(entries));
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
    setEditing(room);
  }

  function onUpdated(room: RoomResponse) {
    setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
    setEditing(null);
  }

  function onRoomImages(roomId: number, images: HotelImage[]) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, images } : r)));
    setEditing((cur) => (cur && cur.id === roomId ? { ...cur, images } : cur));
  }

  async function handleDelete(room: RoomResponse) {
    if (!window.confirm(t("hrm.deleteConfirm", { name: room.name }))) return;
    setBusy(room.id);
    try {
      await deleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
    } catch (err) {
      console.error("[host.rooms] delete failed", err);
    } finally {
      setBusy(null);
    }
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
            const rawCover = r.images.find((i) => i.is_main)?.url ?? r.images[0]?.url;
            const cover = rawCover ? mediaUrl(rawCover) : undefined;
            const status = roomDisplayStatus(r, bookedToday[r.id] ?? false);
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
                      {t(ROOM_TYPE_LABELS[r.type])}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
                    >
                      {t(STATUS_LABEL_KEYS[status])}
                    </span>
                  </div>
                  <div className="mt-2 font-display text-lg font-bold">
                    <T text={r.name} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    <T text={r.description} />
                  </p>
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
                    onClick={() => setEditing(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                    aria-label={t("ho.edit")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={busy === r.id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive disabled:opacity-50"
                    aria-label={t("ho.delete")}
                  >
                    {busy === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showForm || editing) && hotelId !== null && (
        <RoomForm
          hotelId={hotelId}
          hotels={hotels}
          onPickHotel={setHotelId}
          editRoom={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCreated={onCreated}
          onUpdated={onUpdated}
          onRoomImages={onRoomImages}
        />
      )}
    </div>
  );
}

function RoomForm({
  hotelId,
  hotels,
  onPickHotel,
  editRoom,
  onClose,
  onCreated,
  onUpdated,
  onRoomImages,
}: {
  hotelId: number;
  hotels: Hotel[];
  onPickHotel: (id: number) => void;
  editRoom: RoomResponse | null;
  onClose: () => void;
  onCreated: (r: RoomResponse) => void;
  onUpdated: (r: RoomResponse) => void;
  onRoomImages: (roomId: number, images: HotelImage[]) => void;
}) {
  const { t } = useI18n();
  const [number, setNumber] = useState(editRoom?.room_number ?? "");
  const [name, setName] = useState(editRoom?.name ?? "");
  const [type, setType] = useState<RoomType>(editRoom?.type ?? "standard");
  const [price, setPrice] = useState(editRoom ? String(editRoom.price_per_night) : "");
  const [adults, setAdults] = useState(editRoom ? String(editRoom.capacity_adults) : "2");
  const [children, setChildren] = useState(editRoom ? String(editRoom.capacity_children) : "0");
  const [bedCount, setBedCount] = useState(editRoom ? String(editRoom.bed_count) : "0");
  const [bedPrice, setBedPrice] = useState(editRoom?.price_per_bed ?? "");
  const [description, setDescription] = useState(editRoom?.description ?? "");
  const [images, setImages] = useState<HotelImage[]>(editRoom?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!editRoom || !files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const img = await uploadRoomImage(editRoom.id, file, next.length === 0);
        next.push(img);
      }
      setImages(next);
      onRoomImages(editRoom.id, next);
    } catch (err) {
      setError(translateApiError(err, t, "ho.deleteError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage(imageId: number) {
    if (!editRoom) return;
    setError(null);
    try {
      await deleteRoomImage(editRoom.id, imageId);
      const next = images.filter((i) => i.id !== imageId);
      setImages(next);
      onRoomImages(editRoom.id, next);
    } catch (err) {
      setError(translateApiError(err, t, "ho.deleteError"));
    }
  }

  async function handleSave() {
    setError(null);
    if (number.trim().length < 1 || name.trim().length < 2 || description.trim().length < 5) {
      setError(t("hrm.validation"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        room_number: number.trim(),
        name: name.trim(),
        type,
        price_per_night: Number(price) || 0,
        capacity_adults: Number(adults) || 1,
        capacity_children: Number(children) || 0,
        bed_count: Number(bedCount) || 0,
        price_per_bed: Number(bedCount) > 0 ? Number(bedPrice) || 0 : null,
        description: description.trim(),
      };
      if (editRoom) {
        onUpdated(await updateRoom(editRoom.id, payload));
      } else {
        onCreated(await createRoom(hotelId, payload));
      }
    } catch (err) {
      setError(translateApiError(err, t, "hrm.validation"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">
            {editRoom ? t("hrm.editTitle") : t("hrm.addTitle")}
          </h2>
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
          {!editRoom && hotels.length > 1 && (
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
          <Field label="Количество кроватей для отдельной аренды">
            <Input
              type="number"
              value={bedCount}
              onChange={(e) => setBedCount(e.target.value)}
              min={0}
            />
          </Field>
          {Number(bedCount) > 0 && (
            <Field label="Цена одной кровати за ночь">
              <Input
                type="number"
                value={bedPrice}
                onChange={(e) => setBedPrice(e.target.value)}
                min={1}
                placeholder="1000"
              />
            </Field>
          )}
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

        <div className="mt-5">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("ho.photos")}
          </div>
          {editRoom ? (
            <>
              {images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="group relative">
                      <img
                        src={mediaUrl(img.url)}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition group-hover:opacity-100"
                        aria-label={t("ho.delete")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-accent/40">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}{" "}
                {t("ho.uploadPhoto")}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("hrm.photoHint")}</p>
          )}
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
