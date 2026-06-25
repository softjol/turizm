import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getAccessToken,
  type NotificationResponse,
} from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";

export default function NotificationsPage() {
  const { t, lang } = useI18n();
  useDocumentTitle(t("nt.title"));
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      return;
    }
    getNotifications()
      .then(setItems)
      .catch((err) => console.error("[notifications] load failed", err))
      .finally(() => setLoading(false));
  }, [authed]);

  async function handleMarkAll() {
    await markAllNotificationsRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleClick(n: NotificationResponse) {
    if (n.is_read) return;
    await markNotificationRead(n.id).catch(() => {});
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleString(lang === "en" ? "en-US" : "ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AppShell>
      <div className="container-app py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">{t("nt.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("nt.subtitle")}</p>
          </div>
          {items.some((n) => !n.is_read) && (
            <Button variant="outline" className="gap-2" onClick={handleMarkAll}>
              <CheckCheck className="h-4 w-4" /> {t("nt.markAll")}
            </Button>
          )}
        </div>

        {!authed ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Button asChild className="mt-2">
              <Link to="/auth">{t("menu.login")}</Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-card p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-3 text-sm text-muted-foreground">{t("nt.empty")}</div>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-4 p-5 text-left transition hover:bg-muted/40 ${
                  n.is_read ? "" : "bg-primary/5"
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    n.is_read ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <span className="flex-1">
                  <span className="block font-semibold">{n.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {fmt(n.created_at)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
