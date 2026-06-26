import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface">
      <div className="container-app grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-display text-lg font-extrabold">StayKG</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">{t("footer.about")}</p>
        </div>
        <div>
          <div className="text-sm font-semibold">{t("footer.platform")}</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/estates" className="hover:text-foreground">
                {t("footer.catalog")}
              </Link>
            </li>
            <li>
              <Link to="/host" className="hover:text-foreground">
                {t("footer.listPlace")}
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-foreground">
                {t("footer.myBookings")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">{t("footer.contacts")}</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>+996 (312) 00 00 00</li>
            <li>support@staykg.kg</li>
            <li>{t("footer.location")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5">
        <div className="container-app flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row">
          <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
          <span>{t("footer.tagline2")}</span>
        </div>
      </div>
    </footer>
  );
}
