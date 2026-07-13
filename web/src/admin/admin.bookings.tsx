import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminBookings, adminCancelBooking, type AdminBookingResponse } from "@/lib/api/admin";
import type { BookingStatus } from "@/lib/api/bookings";
import { useI18n } from "@/lib/i18n";

type FilterKey =
  | "all"
  | "awaitingPayment"
  | "awaitingConfirm"
  | "confirmed"
  | "checkedIn"
  | "completed"
  | "cancelled";

const FILTER_KEYS: { key: FilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "ad.bkAll" },
  { key: "awaitingPayment", labelKey: "ad.bkAwaitingPayment" },
  { key: "awaitingConfirm", labelKey: "mb.statusPending" },
  { key: "confirmed", labelKey: "mb.statusConfirmed" },
  { key: "checkedIn", labelKey: "mb.statusCheckedIn" },
  { key: "completed", labelKey: "mb.statusCompleted" },
  { key: "cancelled", labelKey: "mb.statusCancelled" },
];

const FILTER_STATUSES: Record<FilterKey, BookingStatus[] | null> = {
  all: null,
  awaitingPayment: ["pending"],
  awaitingConfirm: ["pending"],
  confirmed: ["confirmed"],
  checkedIn: ["checked_in"],
  completed: ["completed", "checked_out"],
  cancelled: ["cancelled", "rejected"],
};

const CANCELLABLE: BookingStatus[] = ["pending", "confirmed", "checked_in"];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "mb.statusPending",
  confirmed: "mb.statusConfirmed",
  checked_in: "mb.statusCheckedIn",
  checked_out: "mb.statusCompleted",
  completed: "mb.statusCompleted",
  cancelled: "mb.statusCancelled",
  rejected: "mb.statusCancelled",
};

const PAGE_SIZE = 100;

export default function AdminBookings() {
  const { t } = useI18n();
  const [rows, setRows] = useState<AdminBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getAdminBookings(undefined, 1, PAGE_SIZE);
        if (active) {
          setRows(data);
          setPage(1);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error("[admin.bookings] load failed", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getAdminBookings(undefined, nextPage, PAGE_SIZE);
      setRows((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("[admin.bookings] load more failed", err);
    } finally {
      setLoadingMore(false);
    }
  }

  const visible = useMemo(() => {
    return rows.filter((r) => {
      const statuses = FILTER_STATUSES[filter];
      if (statuses && !statuses.includes(r.status)) return false;
      if (filter === "awaitingPayment" && r.is_paid) return false;
      if (filter === "awaitingConfirm" && !r.is_paid) return false;
      return true;
    });
  }, [rows, filter]);

  async function handleCancel(id: number) {
    if (!window.confirm(t("ad.bkCancelConfirm"))) return;
    setBusy(id);
    try {
      const updated = await adminCancelBooking(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error).message;
      alert(detail);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navBookings")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.bookingsSubtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {FILTER_KEYS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("hb.loading")}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("ad.bookingsEmpty")}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-surface text-left">
              <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">{t("hb.guest")}</th>
                <th className="px-5 py-3">{t("hb.hotel")}</th>
                <th className="px-5 py-3">{t("hb.room")}</th>
                <th className="px-5 py-3">{t("hb.dates")}</th>
                <th className="px-5 py-3">{t("hb.total")}</th>
                <th className="px-5 py-3">{t("ad.colStatus")}</th>
                <th className="px-5 py-3 text-right">{t("hb.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold">{r.guest_name}</td>
                  <td className="px-5 py-4">{r.hotel_name}</td>
                  <td className="px-5 py-4">{r.room_number}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {r.date_from} – {r.date_to}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold">
                    {Number(r.total_amount).toLocaleString("ru-RU")} {t("common.kgs")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.status === "confirmed" || r.status === "checked_in"
                          ? "bg-success/15 text-success"
                          : r.status === "cancelled" || r.status === "rejected"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-warning/20 text-warning-foreground"
                      }`}
                    >
                      {t(STATUS_LABEL[r.status])}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      {CANCELLABLE.includes(r.status) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === r.id}
                          className="h-8 gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleCancel(r.id)}
                        >
                          {busy === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}{" "}
                          {t("mb.cancel")}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" disabled={loadingMore} onClick={handleLoadMore} className="gap-2">
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("ad.bkLoadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
