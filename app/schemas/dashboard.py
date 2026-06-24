from pydantic import BaseModel
from app.schemas.booking import BookingResponse

class PopularHotelItem(BaseModel):
    hotel_id: int
    name: str
    bookings_count: int
    rating: float

class AdminDashboardResponse(BaseModel):
    users_count: int
    hotels_count: int
    rooms_count: int
    bookings_count: int
    popular_hotels: list[PopularHotelItem] = []
    average_rating: float
    total_revenue: float

class ReceptionDashboardResponse(BaseModel):
    total_rooms: int
    free_rooms: int
    occupied_rooms: int
    bookings_count: int
    guests_count: int
    average_rating: float
    recent_bookings: list[BookingResponse] = []

class ReceptionFinanceResponse(BaseModel):
    revenue_today: float
    revenue_week: float
    revenue_month: float
    bookings_count: int
    deposits_total: float
