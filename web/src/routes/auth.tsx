import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isAxiosError } from "axios";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, UserPlus, Users, Building2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { login, register, verifyEmail, resendCode } from "@/lib/api";

type Mode = "login" | "register";
type RegisterStep = "role" | "form" | "code";

export default function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  useDocumentTitle(t("auth.docTitle"));
  const [mode, setMode] = useState<Mode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("role");
  const [selectedRole, setSelectedRole] = useState<"user" | "reception">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  function describeError(err: unknown): string {
    if (isAxiosError(err)) {
      const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
      return detail ?? err.message;
    }
    return err instanceof Error ? err.message : "Unexpected error";
  }

  function switchMode(next: Mode) {
    setMode(next);
    setRegisterStep("role");
    setError(null);
    setPassword("");
    setCode("");
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name, email, password, role: selectedRole });
        setRegisterStep("code");
      } else {
        await login(email, password);
        await refresh();
        navigate(selectedRole === "reception" ? "/host" : "/");
      }
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(email, code);
      await refresh();
      navigate(selectedRole === "reception" ? "/host" : "/");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setResent(false);
    setLoading(true);
    try {
      await resendCode(email);
      setResent(true);
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
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-border/70 bg-card p-10 shadow-[var(--shadow-card)]">
            {registerStep !== "code" && (
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

            {/* Role selection step */}
            {isRegister && registerStep === "role" && (
              <>
                <h1 className="text-center font-display text-2xl font-extrabold">{t("auth.roleTitle")}</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">{t("auth.roleSubtitle")}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("user")}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition ${
                      selectedRole === "user"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedRole === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Users className="h-6 w-6" />
                    </span>
                    <span className="font-semibold">{t("auth.roleTourist")}</span>
                    <span className="text-xs text-muted-foreground">{t("auth.roleTouristDesc")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("reception")}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition ${
                      selectedRole === "reception"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedRole === "reception" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Building2 className="h-6 w-6" />
                    </span>
                    <span className="font-semibold">{t("auth.roleHost")}</span>
                    <span className="text-xs text-muted-foreground">{t("auth.roleHostDesc")}</span>
                  </button>
                </div>

                <Button
                  size="lg"
                  className="mt-6 w-full rounded-xl gap-2"
                  onClick={() => setRegisterStep("form")}
                >
                  {t("auth.roleNext")} <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Registration / Login form */}
            {(!isRegister || registerStep === "form") && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
                  {isRegister ? <UserPlus className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
                </div>
                <h1 className="mt-5 text-center font-display text-2xl font-extrabold">
                  {isRegister ? t("auth.titleRegister") : t("auth.titleEmail")}
                </h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {isRegister ? t("auth.subtitleRegister") : t("auth.subtitleEmail")}
                </p>

                {error && (
                  <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
                    {error}
                  </div>
                )}

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
                  <Field label={t("auth.email")}>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aigul@example.com"
                      required
                    />
                  </Field>
                  <Field label={t("auth.password")}>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={isRegister ? 6 : undefined}
                        className="pl-9 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {isRegister ? t("auth.register") : t("auth.login")}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {isRegister && (
                    <button
                      type="button"
                      onClick={() => setRegisterStep("role")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Назад
                    </button>
                  )}

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

                <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t("auth.orDivider")}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton onError={setError} role={isRegister ? selectedRole : "user"} />
              </>
            )}

            {/* Email confirmation step (registration only) */}
            {isRegister && registerStep === "code" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
                  <Mail className="h-6 w-6" />
                </div>
                <h1 className="mt-5 text-center font-display text-2xl font-extrabold">{t("auth.titleCode")}</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {t("auth.subtitleCode", { email })}
                </p>

                {error && (
                  <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
                    {error}
                  </div>
                )}
                {resent && !error && (
                  <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-center text-sm text-primary">
                    {t("auth.codeResent")}
                  </div>
                )}

                <form onSubmit={handleVerifyEmail} className="mt-6 space-y-4">
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
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.confirm")}
                  </Button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("auth.resendCode")}
                  </button>
                </form>
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
