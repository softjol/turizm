import { useI18n } from "@/lib/i18n";

export default function AdminReviews() {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.reviewsTitle")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.reviewsSubtitle")}</p>

      <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
        {t("ad.reviewsEmpty")}
      </div>
    </div>
  );
}
