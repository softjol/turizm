import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Globe, Menu, User, Check, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, languages } from "@/lib/i18n";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-extrabold tracking-tight">StayKG</div>
      </div>
    </Link>
  );
}

function LanguageMenu() {
  const { lang, setLang } = useI18n();
  const current = languages.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden gap-1.5 rounded-full md:inline-flex">
          <Globe className="h-4 w-4" /> {current?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="flex items-center justify-between"
          >
            {l.label}
            {l.code === lang && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }
  const nav = [
    { to: "/estates", label: t("nav.estates") },
    { to: "/bookings", label: t("nav.bookings") },
    { to: "/favorites", label: t("nav.favorites") },
    { to: "/host", label: t("nav.host") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-app flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageMenu />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={t("a11y.notifications")}
          >
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex h-10 items-center gap-2 rounded-full border border-border bg-background pl-1.5 pr-3 transition-colors hover:shadow-[var(--shadow-soft)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </span>
                <Menu className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!isAuthenticated ? (
                <DropdownMenuItem asChild>
                  <Link to="/auth">{t("menu.login")}</Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t("menu.profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookings">{t("menu.myBookings")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites">{t("menu.favorites")}</Link>
                  </DropdownMenuItem>
                  {hasRole("reception", "admin") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/host">{t("menu.hostPanel")}</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {hasRole("admin") && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">{t("menu.adminPanel")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> {t("menu.logout")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("a11y.menu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 md:hidden">
          <nav className="container-app flex flex-col gap-1 py-3">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
