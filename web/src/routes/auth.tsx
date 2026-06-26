import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isAxiosError } from "axios";
import { Phone, ArrowRight, MessageCircle, ShieldCheck, Loader2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { requestOtp, verifyOtp, register } from "@/lib/api";

type Mode = "login" | "register";

export default function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  useDocumentTitle(t("auth.docTitle"));
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<"form" | "code">("form");
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

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    setError(null);
    setCode("");
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name, whatsapp_phone_number: phone });
        await requestOtp(phone);
      } else {
        // Login: number must already be registered.
        try {
          await requestOtp(phone);
        } catch (err) {
          if (isAxiosError(err) && err.response?.status === 404) {
            setError(t("auth.notRegistered"));
            return;
          }
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
      await verifyOtp(phone, code);
      await refresh(); // hydrate auth context so the header/menu update
      navigate("/profile");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <AppShell>
      <div className="container-app grid min-h-[calc(100vh-200px)] place-items-center py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-[var(--shadow-card)]">
            {/* Login / Register tabs */}
            {step === "form" && (
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    !isRegister ? "bg-card shadow-[var(--shadow-soft)]" : "text-muted-foreground"
                  }`}
                >
                  {t("auth.tabLogin")}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    isRegister ? "bg-card shadow-[var(--shadow-soft)]" : "text-muted-foreground"
                  }`}
                >
                  {t("auth.tabRegister")}
                </button>
              </div>
            )}

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
              {step === "code" ? (
                <MessageCircle className="h-6 w-6" />
              ) : isRegister ? (
                <UserPlus className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </div>
            <h1 className="mt-5 text-center font-display text-2xl font-extrabold">
              {step === "code"
                ? t("auth.titleCode")
                : isRegister
                  ? t("auth.titleRegister")
                  : t("auth.titlePhone")}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {step === "code"
                ? t("auth.subtitleCode", { phone })
                : isRegister
                  ? t("auth.subtitleRegister")
                  : t("auth.subtitlePhone")}
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {step === "form" ? (
              <form onSubmit={handleSubmitForm} className="mt-6 space-y-4">
                {isRegister && (
                  <Field label={t("auth.name")}>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("auth.namePlaceholder")}
                      required
                    />
                  </Field>
                )}
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
                      {isRegister ? t("auth.register") : t("auth.getCode")}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {isRegister ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(isRegister ? "login" : "register")}
                    className="font-semibold text-primary hover:underline"
                  >
                    {isRegister ? t("auth.tabLogin") : t("auth.tabRegister")}
                  </button>
                </p>
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
                    setStep("form");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("auth.changeNumber")}
                </button>
              </form>
            )}

            {step === "form" && (
              <>
                <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t("auth.orDivider")}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton onError={setError} />
              </>
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
