import { useEffect, useState } from "react";
import { Eye, X, Building2, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getComplaints, type ComplaintResponse } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function AdminComplaints() {
  const { t } = useI18n();
  const [items, setItems] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints()
      .then(setItems)
      .catch((err) => console.error("[admin.complaints] load failed", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navComplaints")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.complaintsSubtitle")}</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
          {t("ad.complaintsEmpty")}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-180 text-sm">
            <thead className="bg-surface text-left">
              <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">№</th>
                <th className="px-5 py-3">{t("ad.colFrom")}</th>
                <th className="px-5 py-3">{t("ad.colTarget")}</th>
                <th className="px-5 py-3">{t("ad.colReason")}</th>
                <th className="px-5 py-3">{t("ad.colDate")}</th>
                <th className="px-5 py-3">{t("ad.colStatus")}</th>
                <th className="px-5 py-3 text-right">{t("hb.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-5 py-4 font-mono text-xs">C-{c.id}</td>
                  <td className="px-5 py-4 font-semibold">{t("hb.guestN", { id: c.user_id })}</td>
                  <td className="px-5 py-4">
                    {c.target_type} #{c.target_id}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.reason}</td>
                  <td className="px-5 py-4">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning-foreground">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8 gap-1">
                        <Eye className="h-3.5 w-3.5" /> {t("ad.review")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1">
                        <X className="h-3.5 w-3.5" /> {t("hb.reject")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive">
                        <Building2 className="h-3.5 w-3.5" /> {t("ad.blockHotel")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive">
                        <UserX className="h-3.5 w-3.5" /> {t("ad.blockUser")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
