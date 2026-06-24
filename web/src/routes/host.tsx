import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Bed,
  Calendar,
  CalendarDays,
  Star,
  Wallet,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocumentTitle } from "@/hooks/use-document-title";

const nav = [
  { to: "/host", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { to: "/host/objects", label: "Объекты", icon: Home },
  { to: "/host/rooms", label: "Комнаты", icon: Bed },
  { to: "/host/bookings", label: "Бронирования", icon: Calendar },
  { to: "/host/calendar", label: "Календарь", icon: CalendarDays },
  { to: "/host/reviews", label: "Отзывы", icon: Star },
  { to: "/host/finance", label: "Финансы", icon: Wallet },
  { to: "/host/settings", label: "Моя гостиница", icon: Building2 },
];

export default function HostLayout() {
  const pathname = useLocation().pathname;
  useDocumentTitle("Кабинет ресепшена — MEIMAN");
  return (
    <AppShell>
      <div className="container-app grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border/70 bg-card p-3">
            <div className="px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ресепшен
              </div>
              <div className="mt-0.5 font-display text-base font-bold">Капсула «Булан»</div>
            </div>
            <nav className="mt-2 space-y-0.5">
              {nav.map((n) => {
                const active = n.exact
                  ? pathname === n.to
                  : pathname.startsWith(n.to) && n.to !== "/host";
                const isHost = pathname === "/host" && n.exact;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active || isHost
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
