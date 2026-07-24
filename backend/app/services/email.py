import asyncio
import smtplib
from email.mime.text import MIMEText

from app.config.settings import settings


def _send_sync(to_email: str, subject: str, body: str) -> None:
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = to_email

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(msg["From"], [to_email], msg.as_string())


async def send_otp_email(to_email: str, code: str) -> None:
    """Send the email-confirmation code. Falls back to printing it to the
    server console when SMTP credentials aren't configured, or when the send
    fails (misconfigured SMTP shouldn't break registration - the code is
    still valid and the user can request a resend once SMTP is fixed)."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"\n--- [EMAIL OTP MOCK] To: {to_email}, Code: {code} ---\n", flush=True)
        return

    subject = "StayKG - подтверждение email"
    body = f"Ваш код подтверждения: {code}\n\nКод действителен 5 минут."
    try:
        await asyncio.to_thread(_send_sync, to_email, subject, body)
    except Exception as e:
        print(f"\n--- [EMAIL SEND FAILED] To: {to_email}, Code: {code}, Error: {e} ---\n", flush=True)
