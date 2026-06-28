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
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://instagram.com/staykg"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white transition-transform hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.8c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.64 3.64 0 0 0-.88-1.35 3.64 3.64 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96Zm0 1.8a3.18 3.18 0 1 0 0 6.36 3.18 3.18 0 0 0 0-6.36Zm5.18-3.24a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32Z" />
              </svg>
            </a>
            <a
              href="https://wa.me/996312000000"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25d366] text-white transition-transform hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.5 9.5 0 0 1-4.83-1.32l-.35-.21-3.59.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.04c0-5.23 4.26-9.49 9.5-9.49 2.54 0 4.92.99 6.71 2.78a9.42 9.42 0 0 1 2.78 6.72c0 5.23-4.26 9.48-9.5 9.48Zm8.08-17.56A11.26 11.26 0 0 0 12.04 1C5.84 1 .8 6.04.8 12.24c0 1.98.52 3.92 1.5 5.63L.7 23.5l5.77-1.51a11.2 11.2 0 0 0 5.56 1.42h.01c6.2 0 11.24-5.04 11.24-11.24 0-3-1.17-5.82-3.16-7.94Z" />
              </svg>
            </a>
            <a
              href="https://t.me/staykg"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ed9] text-white transition-transform hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M21.94 4.6 18.9 19.05c-.23 1.01-.83 1.26-1.68.78l-4.65-3.43-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73 8.6-7.77c.37-.33-.08-.52-.58-.19L7.1 12.97l-4.58-1.43c-1-.31-1.02-1 .21-1.48l17.9-6.9c.83-.31 1.56.19 1.31 1.44Z" />
              </svg>
            </a>
          </div>
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
