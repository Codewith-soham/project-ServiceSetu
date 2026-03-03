import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/useAuth";
import { createBooking, getProviders } from "../services/provider.api";

const UserDashboard = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch((err) => setMessage(err?.response?.data?.message || "Unable to load providers"))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (providerId) => {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1);

    try {
      await createBooking({ providerId, bookingDate: bookingDate.toISOString(), note: "Booked from dashboard" });
      setMessage("Booking request sent successfully.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">User Dashboard</h1>
        <p className="mt-1 text-slate-600">Hi {user?.fullname}, discover nearby professionals and place a booking.</p>

        {message && <p className="mt-4 rounded-lg bg-sky-100 px-4 py-2 text-sm text-sky-800">{message}</p>}

        {loading ? (
          <p className="mt-6 text-slate-500">Loading providers...</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <article key={provider.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="font-semibold">{provider.name}</h2>
                <p className="text-sm text-slate-600">{provider.serviceType}</p>
                <p className="mt-2 text-sm">⭐ {provider.rating || 0} ({provider.totalReviews} reviews)</p>
                <p className="text-sm text-slate-700">Estimated price: ₹{provider.price ?? "N/A"}</p>
                <button onClick={() => handleBook(provider.id)} className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  Book for tomorrow
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
