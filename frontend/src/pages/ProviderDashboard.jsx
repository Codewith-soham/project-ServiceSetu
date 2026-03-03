import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { getProviderBookings } from "../services/provider.api";

const ProviderDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProviderBookings()
      .then(setBookings)
      .catch((err) => setMessage(err?.response?.data?.message || "Unable to fetch bookings"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Provider Dashboard</h1>
        <p className="mt-1 text-slate-600">Track incoming booking requests and customer details.</p>

        {message && <p className="mt-4 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">{message}</p>}

        {loading ? (
          <p className="mt-6 text-slate-500">Loading bookings...</p>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.length === 0 && <p className="text-slate-500">No bookings assigned yet.</p>}
            {bookings.map((booking) => (
              <div key={booking._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">Customer: {booking.user?.fullname}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide">{booking.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">Email: {booking.user?.email}</p>
                <p className="text-sm text-slate-600">Address: {booking.user?.address}</p>
                <p className="mt-2 text-sm">Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderDashboard;
