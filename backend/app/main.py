from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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