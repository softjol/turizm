import { User, Phone, Mail, Edit2, Languages } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n, languages } from "@/lib/i18n";

export default function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  useDocumentTitle(t("profile.docTitle"));
  return (
    <AppShell>
      <div className="container-app max-w-3xl py-12">
        <h1 className="font-display text-3xl font-extrabold">{t("profile.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("profile.subtitle")}</p>

        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-8 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <User className="h-9 w-9" />
            </div>
            <div className="flex-1">
              <div className="font-display text-2xl font-bold">Айгуль Турсунова</div>
              <div className="text-sm text-muted-foreground">{t("profile.role")}</div>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" /> {t("profile.edit")}
            </Button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label={t("profile.name")} icon={User} value="Айгуль Турсунова" />
            <Field label={t("profile.phone")} icon={Phone} value="+996 700 11 22 33" />
            <Field label={t("profile.email")} icon={Mail} value="aigul@example.com" />
            <Field label={t("profile.city")} value="Бишкек" />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Languages className="h-5 w-5" /> {t("profile.language")}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                  lang === l.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-8">
          <h2 className="font-display text-xl font-bold">{t("profile.security")}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label={t("profile.loginMethod")} value={t("profile.loginMethodValue")} />
            <Row label={t("profile.lastLogin")} value={t("profile.lastLoginValue")} />
          </div>
          <Button variant="outline" className="mt-6">
            {t("profile.logout")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <Input defaultValue={value} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
