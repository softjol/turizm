import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Bed,
  Calendar,
  Star,
  Flag,
  Tag,
  Sparkles,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useDocumentTitle } from "@/hooks/use-document-title";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Пользователи", icon: Users },
  { to: "/admin/hotels", label: "Гостиницы", icon: Building2 },
  { to: "/admin/rooms", label: "Комнаты", icon: Bed },
  { to: "/admin/bookings", label: "Бронирования", icon: Calendar },
  { to: "/admin/reviews", label: "Отзывы", icon: Star },
  { to: "/admin/complaints", label: "Жалобы", icon: Flag },
  { to: "/admin/categories", label: "Категории жилья", icon: Tag },
  { to: "/admin/amenities", label: "Удобства", icon: Sparkles },
  { to: "/admin/finance", label: "Финансы", icon: Wallet },
  { to: "/admin/notifications", label: "Уведомления", icon: Bell },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
];

export default function AdminLayout() {
  const pathname = useLocation().pathname;
  useDocumentTitle("Админ-панель — MEIMAN");
  return (
    <AppShell>
      <div className="container-app grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border/70 bg-card p-3">
            <div className="px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Администратор
              </div>
              <div className="mt-0.5 font-display text-base font-bold">MEIMAN Panel</div>
            </div>
            <nav className="mt-2 space-y-0.5">
              {nav.map((n) => {
                const active = n.exact
                  ? pathname === n.to
                  : pathname.startsWith(n.to) && n.to !== "/admin";
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
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
