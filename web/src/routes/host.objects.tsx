import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { Plus, Edit2, Trash2, Eye, Loader2 } from "lucide-react";
import {
  listReceptionHotels,
  updateHotel,
  deleteHotel,
  removeMyHotelId,
  type Hotel,
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
      const detail = isAxiosError(err)
        ? ((err.response?.data as { detail?: string } | undefined)?.detail ?? err.message)
        : t("ho.deleteError");
      alert(detail);
    }
  }

  function onSaved(updated: Hotel) {
    setObjects((prev) => prev.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)));
    setEditing(null);
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
            const cover = e.images.find((img) => img.is_main)?.url ?? e.images[0]?.url;
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

      <EditDialog hotel={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
    </div>
  );
}

function EditDialog({
  hotel,
  onClose,
  onSaved,
}: {
  hotel: Hotel | null;
  onClose: () => void;
  onSaved: (h: Hotel) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setDescription(hotel.description);
      setAddress(hotel.address);
      setPhone(hotel.phone);
      setWhatsapp(hotel.whatsapp);
      setError(null);
    }
  }, [hotel]);

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
      setError(
        isAxiosError(err)
          ? ((err.response?.data as { detail?: string } | undefined)?.detail ?? err.message)
          : t("ho.deleteError"),
      );
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
