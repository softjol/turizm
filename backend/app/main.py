import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import (
    auth,
    hotels,
    rooms,
    bookings,
    payments,
    reviews,
    complaints,
    notifications,
    admin,
    reception
)

app = FastAPI(
    title="Tourism Sary-Chelek API",
    version="1.0.0",
    description="Платформа бронирования гостиниц «Туризм Сары-Челек»"
)

# CORS configuration.
# NB: a wildcard "*" origin is invalid together with allow_credentials=True —
# browsers reject "Access-Control-Allow-Origin: *" alongside credentials, which
# surfaces as "No 'Access-Control-Allow-Origin' header is present". So we echo an
# explicit allow-list (overridable via the ALLOWED_ORIGINS env var, comma-separated).
_default_origins = ",".join([
    "https://staykg.softjol.site",
    "http://localhost:5173",
    "http://localhost:8091",
    "http://localhost",
])
allowed_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://staykg.softjol.site"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images (hotel/room photos) from ./static
os.makedirs("static/uploads/hotels", exist_ok=True)
os.makedirs("static/uploads/rooms", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health", tags=["Health"])
async def health_check():
    """Проверка работоспособности сервиса."""
    return {"status": "ok"}

# Registering all routers with API prefix
api_prefix = "/api/v1"

app.include_router(auth.router, prefix=api_prefix)
app.include_router(hotels.router, prefix=api_prefix)
app.include_router(rooms.router, prefix=api_prefix)
app.include_router(bookings.router, prefix=api_prefix)
app.include_router(payments.router, prefix=api_prefix)
app.include_router(reviews.router, prefix=api_prefix)
app.include_router(complaints.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(reception.router, prefix=api_prefix)