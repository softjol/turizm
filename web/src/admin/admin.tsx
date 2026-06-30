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
  LogOut,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

const nav = [
  { to: "/admin", labelKey: "ad.navDashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", labelKey: "ad.navUsers", icon: Users },
  { to: "/admin/hotels", labelKey: "ad.navHotels", icon: Building2 },
  { to: "/admin/rooms", labelKey: "ad.navRooms", icon: Bed },
  { to: "/admin/bookings", labelKey: "ad.navBookings", icon: Calendar },
  { to: "/admin/reviews", labelKey: "ad.navReviews", icon: Star },
  { to: "/admin/complaints", labelKey: "ad.navComplaints", icon: Flag },
  { to: "/admin/categories", labelKey: "ad.navCategories", icon: Tag },
  { to: "/admin/amenities", labelKey: "ad.navAmenities", icon: Sparkles },
  { to: "/admin/finance", labelKey: "ad.navFinance", icon: Wallet },
  { to: "/admin/notifications", labelKey: "ad.navNotifications", icon: Bell },
  { to: "/admin/settings", labelKey: "ad.navSettings", icon: Settings },
];

export default function AdminLayout() {
  const { t } = useI18n();
  const pathname = useLocation().pathname;
  const { signOut } = useAuth();
  useDocumentTitle(t("ad.docTitle"));
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <span className="font-display text-base font-bold">StayKG</span>
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
            Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
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
                <n.icon className="h-4 w-4 shrink-0" />
                {t(n.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Выйти
          </button>
          <Link
            to="/"
            className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            ← На сайт
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col pl-60">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-card px-6">
          <span className="text-sm font-medium text-muted-foreground">
            {t("ad.panelLabel")}
          </span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
