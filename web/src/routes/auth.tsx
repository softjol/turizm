import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { isAxiosError } from "axios";
import { Phone, ArrowRight, MessageCircle, ShieldCheck, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import { requestOtp, verifyOtp, getMe, register, type User } from "@/lib/api";

export default function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  useDocumentTitle(t("auth.docTitle"));
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function describeError(err: unknown): string {
    if (isAxiosError(err)) {
      const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
      return detail ?? err.message;
    }
    return err instanceof Error ? err.message : "Unexpected error";
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // request-otp 404s for an unregistered number; register first, then retry.
      try {
        await requestOtp(phone);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          await register({ name, whatsapp_phone_number: phone });
          await requestOtp(phone);
        } else {
          throw err;
        }
      }
      setStep("code");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await verifyOtp(phone, code);
      console.info("[auth] ✅ tokens received:", tokens);
      const me: User = await getMe();
      console.info("[auth] ✅ GET /auth/me:", me);
      navigate("/profile");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="container-app grid min-h-[calc(100vh-200px)] place-items-center py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
              {step === "phone" ? (
                <Phone className="h-6 w-6" />
              ) : (
                <MessageCircle className="h-6 w-6" />
              )}
            </div>
            <h1 className="mt-5 text-center font-display text-2xl font-extrabold">
              {step === "phone" ? t("auth.titlePhone") : t("auth.titleCode")}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {step === "phone" ? t("auth.subtitlePhone") : t("auth.subtitleCode", { phone })}
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
                <Field label={t("auth.name")}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("auth.namePlaceholder")}
                    required
                  />
                </Field>
                <Field label={t("auth.phone")}>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+996 700 00 00 00"
                    required
                  />
                </Field>
                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {t("auth.getCode")} <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <Field label={t("auth.codeLabel")}>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    className="text-center text-2xl tracking-[0.5em]"
                  />
                </Field>
                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.login")}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("phone");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("auth.changeNumber")}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("auth.dataProtected")}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
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
