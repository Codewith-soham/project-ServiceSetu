import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form);
      navigate(user?.role === "provider" ? "/provider/dashboard" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Login to continue.</p>

          <label className="mt-5 block text-sm">Email</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="mt-4 block text-sm">Password</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button disabled={loading} className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-60">
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-4 text-sm text-slate-500">
            No account? <Link className="text-sky-700" to="/register">Register here</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
