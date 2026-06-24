import { Routes, Route, Link } from "react-router-dom";

import HomePage from "./routes/index";
import AuthPage from "./routes/auth";
import EstatesPage from "./routes/estates";
import EstateDetail from "./routes/estates.$id";
import CheckoutPage from "./routes/checkout";
import BookingsPage from "./routes/bookings";
import FavoritesPage from "./routes/favorites";
import ProfilePage from "./routes/profile";

import HostLayout from "./routes/host";
import HostDashboard from "./routes/host.index";
import HostObjects from "./routes/host.objects";
import NewObjectWizard from "./routes/host.objects.new";
import HostRooms from "./routes/host.rooms";
import HostBookings from "./routes/host.bookings";
import HostCalendar from "./routes/host.calendar";
import HostReviews from "./routes/host.reviews";
import HostMessages from "./routes/host.messages";
import HostFinance from "./routes/host.finance";
import HostSettings from "./routes/host.settings";

// --- Admin panel: isolated under src/admin/, guarded by the `admin` role ---
import { RequireRole } from "./components/RequireRole";
import AdminLayout from "./admin/admin";
import AdminDashboard from "./admin/admin.index";
import AdminUsers from "./admin/admin.users";
import AdminHotels from "./admin/admin.hotels";
import AdminRooms from "./admin/admin.rooms";
import AdminBookings from "./admin/admin.bookings";
import AdminReviews from "./admin/admin.reviews";
import AdminComplaints from "./admin/admin.complaints";
import AdminCategories from "./admin/admin.categories";
import AdminAmenities from "./admin/admin.amenities";
import AdminFinance from "./admin/admin.finance";
import AdminNotifications from "./admin/admin.notifications";
import AdminSettings from "./admin/admin.settings";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/estates" element={<EstatesPage />} />
      <Route path="/estates/:id" element={<EstateDetail />} />
      <Route path="/estates/:id/checkout" element={<CheckoutPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      <Route path="/host" element={<HostLayout />}>
        <Route index element={<HostDashboard />} />
        <Route path="objects" element={<HostObjects />} />
        <Route path="objects/new" element={<NewObjectWizard />} />
        <Route path="rooms" element={<HostRooms />} />
        <Route path="bookings" element={<HostBookings />} />
        <Route path="calendar" element={<HostCalendar />} />
        <Route path="reviews" element={<HostReviews />} />
        <Route path="messages" element={<HostMessages />} />
        <Route path="finance" element={<HostFinance />} />
        <Route path="settings" element={<HostSettings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole roles={["admin"]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="amenities" element={<AdminAmenities />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
