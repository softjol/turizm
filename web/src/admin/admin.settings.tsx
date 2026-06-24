import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export default function AdminSettings() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navSettings")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.settingsSubtitle")}</p>

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">{t("ad.setGeneral")}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label={t("ad.setPlatformName")}>
              <Input placeholder={t("ad.setPlatformName")} />
            </Field>
            <Field label={t("ad.setContactPhone")}>
              <Input placeholder="+996 700 00 00 00" />
            </Field>
            <Field label={t("ad.setCommission")}>
              <Input type="number" defaultValue="10" />
            </Field>
            <Field label={t("ad.setDeposit")}>
              <Input type="number" defaultValue="30" />
            </Field>
            <Field label={t("ad.setCurrency")}>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>{t("ad.curKgs")}</option>
                <option>{t("ad.curUsd")}</option>
              </select>
            </Field>
            <Field label={t("ad.setLanguage")}>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Русский</option>
                <option>Кыргызский</option>
                <option>English</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">{t("ad.setModeration")}</h2>
          <label className="mt-4 flex items-center justify-between">
            <span className="text-sm">{t("ad.setApproveHotels")}</span>
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-[hsl(var(--primary))]" />
          </label>
          <label className="mt-3 flex items-center justify-between">
            <span className="text-sm">{t("ad.setReviewsOnlyGuests")}</span>
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-[hsl(var(--primary))]" />
          </label>
        </div>

        <Button size="lg" className="rounded-xl">
          {t("ad.setSave")}
        </Button>
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
