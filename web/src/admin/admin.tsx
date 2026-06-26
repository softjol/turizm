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
import { useI18n } from "@/lib/i18n";

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
  useDocumentTitle(t("ad.docTitle"));
  return (
    <AppShell>
      <div className="container-app grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border/70 bg-card p-3">
            <div className="px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("ad.panelLabel")}
              </div>
              <div className="mt-0.5 font-display text-base font-bold">StayKG Panel</div>
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
                    {t(n.labelKey)}
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
