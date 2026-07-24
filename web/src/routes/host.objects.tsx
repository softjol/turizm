import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { translateApiError } from "@/lib/apiError";
import { Plus, Edit2, Trash2, Eye, Loader2, Upload, GripVertical, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  listReceptionHotels,
  updateHotel,
  deleteHotel,
  removeMyHotelId,
  uploadHotelImage,
  deleteHotelImage,
  reorderHotelImages,
  mediaUrl,
  type Hotel,
  type HotelImage,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

export default function HostObjects() {
  const { t } = useI18n();
  const [objects, setObjects] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Hotel | null>(null);

  const STATUS_LABEL: Record<Hotel["status"], string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    blocked: t("status.blocked"),
  };
  const STATUS_CLASS: Record<Hotel["status"], string> = {
    pending: "bg-warning/15 text-warning",
    approved: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
    blocked: "bg-destructive/15 text-destructive",
  };

  useEffect(() => {
    let active = true;
    listReceptionHotels()
      .then((hotels) => active && setObjects(hotels))
      .catch((err) => console.error("[host.objects] load failed", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(hotel: Hotel) {
    if (!window.confirm(t("ho.deleteConfirm", { name: hotel.name }))) return;
    try {
      await deleteHotel(hotel.id);
      removeMyHotelId(hotel.id);
      setObjects((prev) => prev.filter((h) => h.id !== hotel.id));
    } catch (err) {
      alert(translateApiError(err, t, "ho.deleteError"));
    }
  }

  function onSaved(updated: Hotel) {
    setObjects((prev) => prev.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)));
    setEditing(null);
  }

  function onImagesUpdated(id: number, images: HotelImage[]) {
    setObjects((prev) => prev.map((h) => (h.id === id ? { ...h, images } : h)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{t("ho.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("ho.subtitle")}</p>
        </div>
        <Link
          to="/host/objects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          <Plus className="h-4 w-4" /> {t("ho.add")}
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : objects.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center">
          <div className="font-display text-lg font-bold">{t("ho.emptyTitle")}</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("ho.emptyHint")}</p>
          <Link
            to="/host/objects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)]"
          >
            <Plus className="h-4 w-4" /> {t("ho.add")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {objects.map((e) => {
            const rawCover = e.images.find((img) => img.is_main)?.url ?? e.images[0]?.url;
            const cover = rawCover ? mediaUrl(rawCover) : undefined;
            return (
              <div
                key={e.id}
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
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[e.status]}`}
                    >
                      {STATUS_LABEL[e.status]}
                    </span>
                    {e.hotel_type && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                        {e.hotel_type.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-display text-lg font-bold">{e.name}</div>
                  <div className="text-sm text-muted-foreground">{e.address}</div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>⭐ {e.rating}</span>
                    <span>
                      {t("ho.checkIn")} {e.check_in_time}
                    </span>
                    <span>
                      {t("ho.checkOut")} {e.check_out_time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/estates/${e.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                    aria-label={t("ho.view")}
                    title={t("ho.view")}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setEditing(e)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary"
                    aria-label={t("ho.edit")}
                    title={t("ho.edit")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(e)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:border-destructive"
                    aria-label={t("ho.delete")}
                    title={t("ho.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditDialog
        hotel={editing}
        onClose={() => setEditing(null)}
        onSaved={onSaved}
        onImagesUpdated={onImagesUpdated}
      />
    </div>
  );
}

function EditDialog({
  hotel,
  onClose,
  onSaved,
  onImagesUpdated,
}: {
  hotel: Hotel | null;
  onClose: () => void;
  onSaved: (h: Hotel) => void;
  onImagesUpdated: (id: number, images: HotelImage[]) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [images, setImages] = useState<HotelImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setDescription(hotel.description);
      setAddress(hotel.address);
      setPhone(hotel.phone);
      setWhatsapp(hotel.whatsapp);
      setImages(hotel.images);
      setError(null);
    }
  }, [hotel]);

  async function handleFiles(files: FileList | null) {
    if (!hotel || !files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const img = await uploadHotelImage(hotel.id, file, next.length === 0);
        next.push(img);
      }
      setImages(next);
      onImagesUpdated(hotel.id, next);
    } catch (err) {
      setError(translateApiError(err, t, "ho.deleteError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage(imageId: number) {
    if (!hotel) return;
    setError(null);
    try {
      await deleteHotelImage(hotel.id, imageId);
      const next = images.filter((i) => i.id !== imageId);
      setImages(next);
      onImagesUpdated(hotel.id, next);
    } catch (err) {
      setError(translateApiError(err, t, "ho.deleteError"));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!hotel || !over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(images, oldIndex, newIndex);
    setImages(next);
    setReordering(true);
    setError(null);
    try {
      const saved = await reorderHotelImages(
        hotel.id,
        next.map((i) => i.id),
      );
      setImages(saved);
      onImagesUpdated(hotel.id, saved);
    } catch (err) {
      setImages(images); // revert on failure
      setError(translateApiError(err, t, "ho.deleteError"));
    } finally {
      setReordering(false);
    }
  }

  async function handleSave() {
    if (!hotel) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateHotel(hotel.id, {
        name,
        description,
        address,
        phone,
        whatsapp,
      });
      onSaved(updated);
    } catch (err) {
      setError(translateApiError(err, t, "ho.deleteError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!hotel} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("ho.editTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}
          <LabeledInput label={t("ho.name")} value={name} onChange={setName} />
          <label className="block">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("ho.description")}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <LabeledInput label={t("ho.address")} value={address} onChange={setAddress} />
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label={t("ho.phone")} value={phone} onChange={setPhone} />
            <LabeledInput label={t("ho.whatsapp")} value={whatsapp} onChange={setWhatsapp} />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("ho.photos")}
            </div>
            {images.length > 0 && (
              <>
                <p className="mb-2 text-xs text-muted-foreground">{t("ho.dragHint")}</p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {images.map((img) => (
                        <SortablePhoto
                          key={img.id}
                          image={img}
                          disabled={reordering}
                          onRemove={() => handleRemoveImage(img.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
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
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("ho.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("ho.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortablePhoto({
  image,
  disabled,
  onRemove,
}: {
  image: HotelImage;
  disabled: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
    disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative h-16 w-16 shrink-0 rounded-lg ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <img
        src={mediaUrl(image.url)}
        alt=""
        className="h-16 w-16 rounded-lg object-cover"
        draggable={false}
      />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute -top-1.5 -left-1.5 flex h-5 w-5 cursor-grab items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
        aria-label="drag"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-destructive opacity-0 transition group-hover:opacity-100"
        aria-label="remove"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
