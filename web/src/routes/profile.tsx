import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { User, Phone, Mail, Languages, Loader2, Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMe } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n, languages } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const { user, loading, signOut, refresh } = useAuth();
  useDocumentTitle(t("profile.docTitle"));

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.whatsapp_phone_number ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateMe({
        name: name.trim(),
        whatsapp_phone_number: phone.trim() || null,
        email: email.trim() || null,
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(
        isAxiosError(err)
          ? ((err.response?.data as { detail?: string } | undefined)?.detail ?? err.message)
          : t("profile.saveError"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <AppShell>
        <div className="container-app flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="container-app max-w-md py-24 text-center">
          <h1 className="font-display text-2xl font-bold">{t("profile.notLoggedIn")}</h1>
          <Button className="mt-6" onClick={() => navigate("/auth")}>
            {t("menu.login")}
          </Button>
        </div>
      </AppShell>
    );
  }

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
              <div className="font-display text-2xl font-bold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{t(`role.${user.role}`)}</div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <EditField label={t("profile.name")} icon={User} value={name} onChange={setName} />
            <EditField
              label={t("profile.phone")}
              icon={Phone}
              value={phone}
              onChange={setPhone}
              type="tel"
              placeholder="+996 700 123 456"
            />
            <EditField
              label={t("profile.email")}
              icon={Mail}
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.save")}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-success">
                <Check className="h-4 w-4" /> {t("profile.saved")}
              </span>
            )}
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
          </div>
          <Button variant="outline" className="mt-6" onClick={handleLogout}>
            {t("profile.logout")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function FieldLabel({
  label,
  icon: Icon,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel label={label} icon={icon} />
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
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
